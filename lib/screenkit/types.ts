export type Locale = "ru" | "en"

export type LocalizedText = { ru: string; en?: string }
export type LocalizedList = { ru: string[]; en?: string[] }

export type InsertStatus = "draft" | "ready" | "needs review" | "shooting"

export type DeviceType =
  | "phone"
  | "monitor"
  | "tv"
  | "tablet"
  | "projector"
  | "cctv"

export type AspectRatio = "9:16" | "16:9" | "4:3" | "16:10"

export type PlaybackMode = "clean" | "filmed" | "dirty"

export type CategoryId =
  | "phones"
  | "cctv"
  | "trackers"
  | "tv-news"
  | "bank"
  | "hq-monitors"

export type Insert = {
  id: string
  date: string
  episode: string
  scene: string
  category: CategoryId
  device: DeviceType
  aspect: AspectRatio
  status: InsertStatus
  title: LocalizedText
  description: LocalizedText
  prompt: LocalizedText
  shortPrompt: LocalizedText
  negativePrompt: LocalizedText
  technicalNotes: LocalizedList
}

/* a fully resolved insert with all localized text flattened to strings */
export type ResolvedInsert = {
  id: string
  date: string
  episode: string
  scene: string
  category: CategoryId
  device: DeviceType
  aspect: AspectRatio
  status: InsertStatus
  title: string
  description: string
  prompt: string
  shortPrompt: string
  negativePrompt: string
  technicalNotes: string[]
  hasEnglish: boolean
}
