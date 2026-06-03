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
  title: string
  date: string
  episode: string
  scene: string
  category: CategoryId
  device: DeviceType
  aspect: AspectRatio
  status: InsertStatus
  description: string
  prompt: string
  shortPrompt: string
  negativePrompt: string
  technicalNotes: string[]
}
