import type {
  BuiltInCategoryId,
  CategoryDef,
  CategoryId,
  DeviceType,
} from "@/lib/screenkit/types"
import {
  Activity,
  Banknote,
  Bell,
  Building2,
  Camera,
  Cctv,
  Clapperboard,
  Compass,
  Cpu,
  CreditCard,
  Crosshair,
  Eye,
  Film,
  Flag,
  Flame,
  Folder,
  Gauge,
  Globe,
  HardDrive,
  Heart,
  Image as ImageIcon,
  Landmark,
  Layers,
  Lock,
  Map,
  MapPin,
  Monitor,
  MonitorDot,
  MonitorPlay,
  Navigation,
  Newspaper,
  Phone,
  Projector,
  Radar,
  Radio,
  Satellite,
  Server,
  Shield,
  Signal,
  Smartphone,
  Star,
  SunMedium,
  Tablet,
  Tv,
  Video,
  Wallet,
  Watch,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react"

/* ------------------------------------------------------------------ *
 * shared icon library
 *
 * the single source of icon glyphs used both for built-in category icons and
 * for the custom-icon picker shown when creating a category. names are stable
 * string keys persisted to the database (categories.icon).
 * ------------------------------------------------------------------ */
export const ICON_LIBRARY: Record<string, LucideIcon> = {
  layers: Layers,
  smartphone: Smartphone,
  phone: Phone,
  tablet: Tablet,
  monitor: Monitor,
  "monitor-dot": MonitorDot,
  tv: Tv,
  "monitor-play": MonitorPlay,
  projector: Projector,
  camera: Camera,
  cctv: Cctv,
  video: Video,
  film: Film,
  clapperboard: Clapperboard,
  image: ImageIcon,
  newspaper: Newspaper,
  watch: Watch,
  radar: Radar,
  "map-pin": MapPin,
  navigation: Navigation,
  compass: Compass,
  map: Map,
  gauge: Gauge,
  activity: Activity,
  bell: Bell,
  shield: Shield,
  lock: Lock,
  "credit-card": CreditCard,
  wallet: Wallet,
  banknote: Banknote,
  landmark: Landmark,
  building: Building2,
  globe: Globe,
  wifi: Wifi,
  signal: Signal,
  satellite: Satellite,
  radio: Radio,
  server: Server,
  cpu: Cpu,
  "hard-drive": HardDrive,
  folder: Folder,
  star: Star,
  heart: Heart,
  flag: Flag,
  zap: Zap,
  flame: Flame,
  eye: Eye,
  crosshair: Crosshair,
}

/** ordered names for rendering the picker grid */
export const ICON_NAMES = Object.keys(ICON_LIBRARY)

/* built-in category id -> default icon glyph */
export const categoryIcon: Record<BuiltInCategoryId, LucideIcon> = {
  phones: Smartphone,
  cctv: Camera,
  trackers: Radar,
  "tv-news": MonitorPlay,
  bank: Landmark,
  "hq-monitors": MonitorDot,
}

/* legacy helper: built-in id -> icon, generic fallback for custom ids */
export const iconForCategory = (id: CategoryId): LucideIcon =>
  categoryIcon[id as BuiltInCategoryId] ?? Layers

/* resolve a category's icon: a chosen custom icon wins, then the built-in
   mapping, then a generic glyph */
export const categoryIconFor = (cat: CategoryDef): LucideIcon => {
  if (cat.icon && ICON_LIBRARY[cat.icon]) return ICON_LIBRARY[cat.icon]
  return categoryIcon[cat.id as BuiltInCategoryId] ?? Layers
}

export const appearanceIcon = SunMedium

/* device type -> icon, so inserts adopt the glyph of their target device */
export const deviceIcon: Record<DeviceType, LucideIcon> = {
  phone: Smartphone,
  monitor: MonitorDot,
  tv: MonitorPlay,
  tablet: Tablet,
  projector: Projector,
  cctv: Camera,
}

export const iconForDevice = (device: DeviceType): LucideIcon =>
  deviceIcon[device] ?? Layers
