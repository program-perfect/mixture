"use client"

import * as React from "react"
import type {
  AspectRatio,
  CategoryId,
  DeviceType,
  InsertStatus,
  Locale,
  PlaybackMode,
} from "@/lib/screenkit/types"
import { INSERTS, getInsert, hasEnglish } from "@/lib/screenkit/data"
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, translate } from "@/lib/screenkit/i18n"

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

export function ScreenkitProvider({ children }: { children: React.ReactNode }) {
  const [section, setSection] = React.useState<Section>("overview")
  const [selectedId, setSelectedId] = React.useState<string>(INSERTS[0].id)
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
  const [preview, setPreview] = React.useState<PreviewSettings>({
    device: INSERTS[0].device,
    mode: "filmed",
    aspect: INSERTS[0].aspect,
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

  const setInsertLocale = React.useCallback((id: string, l: Locale) => {
    setInsertLocaleOverrides((prev) => ({ ...prev, [id]: l }))
  }, [])

  // resolve the language to use for a given insert's content:
  // explicit override wins, otherwise follow the site language,
  // but never request english on an insert that has no translation.
  const insertLocaleFor = React.useCallback(
    (id: string): Locale => {
      const insert = getInsert(id)
      const english = insert ? hasEnglish(insert) : false
      const wanted = insertLocaleOverrides[id] ?? locale
      return wanted === "en" && !english ? "ru" : wanted
    },
    [insertLocaleOverrides, locale],
  )

  const openInPreview = React.useCallback((id: string) => {
    const insert = getInsert(id)
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
  }, [])

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
