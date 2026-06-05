"use client"

import { cn } from "@/lib/utils"
import {
  Eye,
  FileText,
  GitBranch,
  Info,
  Library,
  Palette,
  type LucideIcon,
} from "lucide-react"
import { useScreenkit, type Section } from "./store"

type RailItem = { id: Section; icon: LucideIcon }

const RAIL_ITEMS: RailItem[] = [
  { id: "library", icon: Library },
  { id: "preview", icon: Eye },
  { id: "timeline", icon: GitBranch },
  { id: "prompts", icon: FileText },
  { id: "style", icon: Palette },
]

export function Rail({ onNavigate }: { onNavigate?: () => void }) {
  const { section, setSection, t } = useScreenkit()

  const go = (s: Section) => {
    setSection(s)
    onNavigate?.()
  }

  return (
    <nav
      aria-label="primary"
      className="flex h-full w-[92px] shrink-0 flex-col items-center gap-1 bg-sidebar px-2 py-3 md:py-4 md:pl-2 md:pr-5"
    >
      {/* project glyph -> overview */}
      <button
        onClick={() => go("overview")}
        aria-label="overview"
        className={cn(
          "mb-3 flex size-12 items-center justify-center rounded-xl border font-mono text-sm font-bold transition-colors",
          section === "overview"
            ? "border-transparent bg-control-active text-control-active-foreground"
            : "border-sidebar-border bg-panel-soft text-foreground hover:bg-panel-hover",
        )}
      >
        гс
      </button>

      <div className="flex flex-1 flex-col items-center gap-1">
        {RAIL_ITEMS.map((item) => {
          const active = section === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => go(item.id)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex w-16 flex-col items-center gap-1 rounded-xl px-1 py-2.5 transition-colors",
                active
                  ? "bg-control-active text-control-active-foreground"
                  : "text-sidebar-muted hover:bg-panel-hover hover:text-foreground",
              )}
            >
              <Icon className="size-5" strokeWidth={1.6} />
              <span className="font-mono text-[10px] lowercase leading-tight">
                {t(`section.${item.id}`)}
              </span>
            </button>
          )
        })}
      </div>

      <button
        onClick={() => go("about")}
        className={cn(
          "flex w-16 flex-col items-center gap-1 rounded-xl px-1 py-2.5 transition-colors",
          section === "about"
            ? "bg-control-active text-control-active-foreground"
            : "text-sidebar-muted hover:bg-panel-hover hover:text-foreground",
        )}
      >
        <Info className="size-5" strokeWidth={1.6} />
        <span className="font-mono text-[10px] lowercase leading-tight">
          {t("nav.about")}
        </span>
      </button>
    </nav>
  )
}
