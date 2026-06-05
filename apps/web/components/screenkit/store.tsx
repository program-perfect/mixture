"use client"

import * as React from "react"
import type {
  AspectRatio,
  CategoryDef,
  CategoryId,
  DeviceType,
  Insert,
  InsertStatus,
  Locale,
  PlaybackMode,
} from "@/lib/screenkit/types"
import {
  DEFAULT_CATEGORY_DEFS,
  INSERTS,
  categoryLabelFromDef,
  findCategoryDef,
  findInsert,
  hasEnglish,
} from "@/lib/screenkit/data"
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, translate } from "@/lib/screenkit/i18n"
import {
  addCategoryAction,
  addInsertAction,
  getLibraryAction,
  resetLibraryAction,
  type LibraryData,
} from "@/app/actions/library"
import {
  DEFAULT_LIBRARY_LIST_SETTINGS,
  type LibraryListSettings,
} from "./library-list-settings"

export type Section =
  | "overview"
  | "library"
  | "preview"
  | "timeline"
  | "prompts"
  | "style"
  | "about"

// each menu item gets its own explicitly-assigned url slug (no transliteration).
export const SECTION_SLUGS: Record<Section, string> = {
  overview: "overview",
  library: "library",
  preview: "preview",
  timeline: "timeline",
  prompts: "metadata",
  style: "appearance",
  about: "info",
}

export function sectionFromSlug(slug?: string | null): Section | null {
  if (!slug) return null
  const entry = (Object.entries(SECTION_SLUGS) as [Section, string][]).find(
    ([, s]) => s === slug,
  )
  return entry ? entry[0] : null
}

/* ------------------------------------------------------------------ *
 * client-side library cache (stale-while-revalidate)
 * ------------------------------------------------------------------ */

const LIBRARY_CACHE_KEY = "screenkit-library-cache-v1"
const CONTENT_WIDTH_STORAGE_KEY = "screenkit-content-width-v1"

function readLibraryCache(): LibraryData | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.sessionStorage.getItem(LIBRARY_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as LibraryData
    if (
      parsed &&
      Array.isArray(parsed.inserts) &&
      Array.isArray(parsed.categories)
    ) {
      return parsed
    }
  } catch {
    // ignore
  }
  return null
}

function writeLibraryCache(data: LibraryData) {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.setItem(LIBRARY_CACHE_KEY, JSON.stringify(data))
  } catch {
    // ignore
  }
}

export type MessengerTheme = "dark" | "light"
export type MessengerVideoFormat = "mixed" | "vertical" | "horizontal" | "square"
export type ContentWidth = "narrow" | "default" | "wide"

export type PreviewSettings = {
  device: DeviceType
  mode: PlaybackMode
  aspect: AspectRatio
  brightness: number
  noise: number
  reflections: boolean
  scanlines: boolean
  timestamp: boolean
  messengerTheme: MessengerTheme
  messengerMotion: boolean
  messengerDelay: number
  messengerVideoFormat: MessengerVideoFormat
  messengerHiddenNumber: boolean
}

export type Filters = {
  search: string
  category: CategoryId | "all"
  device: DeviceType | "all"
  status: InsertStatus | "all"
}

export type NewCategoryInput = Parameters<typeof addCategoryAction>[0]

export type NewInsertInput = Parameters<typeof addInsertAction>[0]

type Ctx = {
  section: Section
  setSection: (s: Section) => void

  selectedId: string
  setSelectedId: (id: string) => void

  filters: Filters
  setFilters: React.Dispatch<React.SetStateAction<Filters>>

  libraryListSettings: LibraryListSettings
  setLibraryListSettings: React.Dispatch<React.SetStateAction<LibraryListSettings>>

  contentWidth: ContentWidth
  setContentWidth: (width: ContentWidth) => void

  preview: PreviewSettings
  setPreview: React.Dispatch<React.SetStateAction<PreviewSettings>>

  mobileNavOpen: boolean
  setMobileNavOpen: (v: boolean) => void

  openInPreview: (id: string) => void

  // dynamic, server-backed library data (defaults + custom)
  inserts: Insert[]
  categories: CategoryDef[]
  getInsert: (id: string) => Insert | undefined
  catDef: (id: CategoryId) => CategoryDef | undefined
  catLabel: (id: CategoryId) => string
  libraryBusy: boolean
  addCategory: (input: NewCategoryInput) => Promise<void>
  addInsert: (input: NewInsertInput) => Promise<void>
  resetLibrary: () => Promise<void>
  hasCustom: boolean

  // site language (persisted)
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string) => string

  // per-insert language override, independent of the site language
  insertLocaleOverrides: Record<string, Locale>
  setInsertLocale: (id: string, l: Locale) => void
  insertLocaleFor: (id: string) => Locale
}

const ScreenkitContext = React.createContext<Ctx | null>(null)

export function ScreenkitProvider({
  children,
  initialInserts,
  initialCategories,
  initialSelectedId,
  initialView,
  initialCategory,
}: {
  children: React.ReactNode
  initialInserts?: Insert[]
  initialCategories?: CategoryDef[]
  /** when provided, open straight into this insert's preview (deep link) */
  initialSelectedId?: string
  /** menu-item slug to open on load (?view=…) */
  initialView?: string
  /** library category slug to open on load (?cat=…) */
  initialCategory?: string
}) {
  const [inserts, setInserts] = React.useState<Insert[]>(
    initialInserts ?? INSERTS,
  )
  const [categories, setCategories] = React.useState<CategoryDef[]>(
    initialCategories ?? DEFAULT_CATEGORY_DEFS,
  )
  const [libraryBusy, setLibraryBusy] = React.useState(false)

  const allInserts = initialInserts ?? INSERTS
  const allCategories = initialCategories ?? DEFAULT_CATEGORY_DEFS
  const deepLinked =
    initialSelectedId && allInserts.some((i) => i.id === initialSelectedId)
      ? initialSelectedId
      : null
  const viewSection = sectionFromSlug(initialView)
  const initialCat =
    initialCategory && allCategories.some((c) => c.id === initialCategory)
      ? (initialCategory as CategoryId)
      : "all"
  const [section, setSection] = React.useState<Section>(
    deepLinked ? "preview" : (viewSection ?? "overview"),
  )
  const [selectedId, setSelectedId] = React.useState<string>(
    deepLinked ?? allInserts[0]?.id ?? "",
  )
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false)
  const [locale, setLocaleState] = React.useState<Locale>(DEFAULT_LOCALE)
  const [contentWidth, setContentWidthState] = React.useState<ContentWidth>("default")
  const [insertLocaleOverrides, setInsertLocaleOverrides] = React.useState<
    Record<string, Locale>
  >({})

  const [filters, setFilters] = React.useState<Filters>({
    search: "",
    category: initialCat,
    device: "all",
    status: "all",
  })
  const [libraryListSettings, setLibraryListSettings] =
    React.useState<LibraryListSettings>(DEFAULT_LIBRARY_LIST_SETTINGS)

  const first =
    (deepLinked ? allInserts.find((i) => i.id === deepLinked) : null) ??
    allInserts[0]
  const [preview, setPreview] = React.useState<PreviewSettings>({
    device: first?.device ?? "phone",
    mode: "clean",
    aspect: first?.aspect ?? "9:16",
    brightness: 70,
    noise: 0,
    reflections: false,
    scanlines: false,
    timestamp: false,
    messengerTheme: "dark",
    messengerMotion: false,
    messengerDelay: 4,
    messengerVideoFormat: "mixed",
    messengerHiddenNumber: true,
  })

  // keep the url in sync with the active menu item so every section/category
  // is addressable by its own slug (no cyrillic transliteration involved).
  React.useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams()
    params.set("view", SECTION_SLUGS[section])
    if (section === "library" && filters.category !== "all") {
      params.set("cat", String(filters.category))
    }
    if (section === "preview" && selectedId) {
      params.set("insert", selectedId)
    }
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${params.toString()}`,
    )
  }, [section, filters.category, selectedId])

  // hydrate site locale and layout width from storage
  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
      if (stored === "ru" || stored === "en") setLocaleState(stored)
      const width = window.localStorage.getItem(CONTENT_WIDTH_STORAGE_KEY)
      if (width === "narrow" || width === "default" || width === "wide") {
        setContentWidthState(width)
      }
    } catch {
      // ignore
    }
  }, [])

  const setLocale = React.useCallback((l: Locale) => {
    setLocaleState(l)
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, l)
    } catch {
      // ignore
    }
  }, [])

  const setContentWidth = React.useCallback((width: ContentWidth) => {
    setContentWidthState(width)
    try {
      window.localStorage.setItem(CONTENT_WIDTH_STORAGE_KEY, width)
    } catch {
      // ignore
    }
  }, [])

  const t = React.useCallback((key: string) => translate(locale, key), [locale])

  const getInsert = React.useCallback(
    (id: string) => findInsert(inserts, id),
    [inserts],
  )
  const catDef = React.useCallback(
    (id: CategoryId) => findCategoryDef(categories, id),
    [categories],
  )
  const catLabel = React.useCallback(
    (id: CategoryId) => {
      const def = findCategoryDef(categories, id)
      return def ? categoryLabelFromDef(def, locale) : String(id)
    },
    [categories, locale],
  )

  const apply = React.useCallback((data: LibraryData) => {
    setCategories(data.categories)
    setInserts(data.inserts)
    writeLibraryCache(data)
  }, [])

  const addCategory = React.useCallback(
    async (input: NewCategoryInput) => {
      setLibraryBusy(true)
      try {
        apply(await addCategoryAction(input))
      } finally {
        setLibraryBusy(false)
      }
    },
    [apply],
  )

  const addInsert = React.useCallback(
    async (input: NewInsertInput) => {
      setLibraryBusy(true)
      try {
        apply(await addInsertAction(input))
      } finally {
        setLibraryBusy(false)
      }
    },
    [apply],
  )

  const resetLibrary = React.useCallback(async () => {
    setLibraryBusy(true)
    try {
      apply(await resetLibraryAction())
    } finally {
      setLibraryBusy(false)
    }
  }, [apply])

  // keep data fresh on mount (in case props were stale / not provided)
  React.useEffect(() => {
    // server provided data -> just mirror it into the cache for later paints
    if (initialInserts && initialCategories) {
      writeLibraryCache({ categories: allCategories, inserts: allInserts })
      return
    }
    // no server data -> paint instantly from cache, then revalidate in the bg
    const cached = readLibraryCache()
    if (cached) apply(cached)
    getLibraryAction().then(apply).catch(() => {})
    // allCategories / allInserts are derived from the (stable) initial props
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apply, initialInserts, initialCategories])

  const setInsertLocale = React.useCallback((id: string, l: Locale) => {
    setInsertLocaleOverrides((prev) => ({ ...prev, [id]: l }))
  }, [])

  // resolve the language to use for a given insert's content:
  // explicit override wins, otherwise follow the site language,
  // but never request english on an insert that has no translation.
  const insertLocaleFor = React.useCallback(
    (id: string): Locale => {
      const insert = findInsert(inserts, id)
      const english = insert ? hasEnglish(insert) : false
      const wanted = insertLocaleOverrides[id] ?? locale
      return wanted === "en" && !english ? "ru" : wanted
    },
    [insertLocaleOverrides, locale, inserts],
  )

  const openInPreview = React.useCallback(
    (id: string) => {
      const insert = findInsert(inserts, id)
      setSelectedId(id)
      if (insert) {
        setPreview((p) => ({
          ...p,
          device: insert.device,
          aspect: insert.aspect,
        }))
      }
      setSection("preview")
      setMobileNavOpen(false)
    },
    [inserts],
  )

  const hasCustom = React.useMemo(
    () =>
      categories.some((c) => c.custom) ||
      inserts.length > INSERTS.length,
    [categories, inserts],
  )

  const value: Ctx = {
    section,
    setSection,
    selectedId,
    setSelectedId,
    filters,
    setFilters,
    libraryListSettings,
    setLibraryListSettings,
    contentWidth,
    setContentWidth,
    preview,
    setPreview,
    mobileNavOpen,
    setMobileNavOpen,
    openInPreview,
    inserts,
    categories,
    getInsert,
    catDef,
    catLabel,
    libraryBusy,
    addCategory,
    addInsert,
    resetLibrary,
    hasCustom,
    locale,
    setLocale,
    t,
    insertLocaleOverrides,
    setInsertLocale,
    insertLocaleFor,
  }

  return (
    <ScreenkitContext.Provider value={value}>
      {children}
    </ScreenkitContext.Provider>
  )
}

export function useScreenkit() {
  const ctx = React.useContext(ScreenkitContext)
  if (!ctx) throw new Error("useScreenkit must be used within ScreenkitProvider")
  return ctx
}
