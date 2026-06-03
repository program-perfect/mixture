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

export type Section =
  | "overview"
  | "library"
  | "preview"
  | "timeline"
  | "prompts"
  | "export"
  | "style"
  | "about"

export type PreviewSettings = {
  device: DeviceType
  mode: PlaybackMode
  aspect: AspectRatio
  brightness: number
  noise: number
  reflections: boolean
  scanlines: boolean
  timestamp: boolean
}

export type Filters = {
  search: string
  category: CategoryId | "all"
  device: DeviceType | "all"
  status: InsertStatus | "all"
}

export type NewCategoryInput = {
  labelRu: string
  labelEn?: string
  accent?: string
  tint?: string
}

export type NewInsertInput = Parameters<typeof addInsertAction>[0]

type Ctx = {
  section: Section
  setSection: (s: Section) => void

  selectedId: string
  setSelectedId: (id: string) => void

  filters: Filters
  setFilters: React.Dispatch<React.SetStateAction<Filters>>

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
}: {
  children: React.ReactNode
  initialInserts?: Insert[]
  initialCategories?: CategoryDef[]
}) {
  const [inserts, setInserts] = React.useState<Insert[]>(
    initialInserts ?? INSERTS,
  )
  const [categories, setCategories] = React.useState<CategoryDef[]>(
    initialCategories ?? DEFAULT_CATEGORY_DEFS,
  )
  const [libraryBusy, setLibraryBusy] = React.useState(false)

  const [section, setSection] = React.useState<Section>("overview")
  const [selectedId, setSelectedId] = React.useState<string>(
    (initialInserts ?? INSERTS)[0]?.id ?? "",
  )
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false)
  const [locale, setLocaleState] = React.useState<Locale>(DEFAULT_LOCALE)
  const [insertLocaleOverrides, setInsertLocaleOverrides] = React.useState<
    Record<string, Locale>
  >({})

  const [filters, setFilters] = React.useState<Filters>({
    search: "",
    category: "all",
    device: "all",
    status: "all",
  })
  const first = (initialInserts ?? INSERTS)[0]
  const [preview, setPreview] = React.useState<PreviewSettings>({
    device: first?.device ?? "phone",
    mode: "filmed",
    aspect: first?.aspect ?? "9:16",
    brightness: 70,
    noise: 35,
    reflections: true,
    scanlines: true,
    timestamp: true,
  })

  // hydrate site locale from storage
  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
      if (stored === "ru" || stored === "en") setLocaleState(stored)
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
    if (initialInserts && initialCategories) return
    getLibraryAction().then(apply).catch(() => {})
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
