"use client"

import * as React from "react"
import type {
  AspectRatio,
  CategoryId,
  DeviceType,
  InsertStatus,
  PlaybackMode,
} from "@/lib/screenkit/types"
import { INSERTS } from "@/lib/screenkit/data"

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
}

const ScreenkitContext = React.createContext<Ctx | null>(null)

export function ScreenkitProvider({ children }: { children: React.ReactNode }) {
  const [section, setSection] = React.useState<Section>("overview")
  const [selectedId, setSelectedId] = React.useState<string>(INSERTS[0].id)
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false)
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

  const openInPreview = React.useCallback((id: string) => {
    const insert = INSERTS.find((i) => i.id === id)
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
