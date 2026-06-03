import {
  Camera,
  Smartphone,
  Radar,
  MonitorPlay,
  Landmark,
  MonitorDot,
  SunMedium,
  Layers,
  type LucideIcon,
} from "lucide-react"
import type {
  BuiltInCategoryId,
  CategoryId,
  DeviceType,
} from "@/lib/screenkit/types"

export const categoryIcon: Record<BuiltInCategoryId, LucideIcon> = {
  phones: Smartphone,
  cctv: Camera,
  trackers: Radar,
  "tv-news": MonitorPlay,
  bank: Landmark,
  "hq-monitors": MonitorDot,
}

/* custom categories fall back to a generic glyph */
export const iconForCategory = (id: CategoryId): LucideIcon =>
  categoryIcon[id as BuiltInCategoryId] ?? Layers

export const appearanceIcon = SunMedium

export const deviceIcon: Record<DeviceType, LucideIcon> = {
  phone: Smartphone,
  monitor: MonitorDot,
  tv: MonitorPlay,
  tablet: Smartphone,
  projector: MonitorPlay,
  cctv: Camera,
}
