import {
  Camera,
  Smartphone,
  Radar,
  MonitorPlay,
  Landmark,
  MonitorDot,
  SunMedium,
  type LucideIcon,
} from "lucide-react"
import type { CategoryId, DeviceType } from "@/lib/screenkit/types"

export const categoryIcon: Record<CategoryId, LucideIcon> = {
  phones: Smartphone,
  cctv: Camera,
  trackers: Radar,
  "tv-news": MonitorPlay,
  bank: Landmark,
  "hq-monitors": MonitorDot,
}

export const appearanceIcon = SunMedium

export const deviceIcon: Record<DeviceType, LucideIcon> = {
  phone: Smartphone,
  monitor: MonitorDot,
  tv: MonitorPlay,
  tablet: Smartphone,
  projector: MonitorPlay,
  cctv: Camera,
}
