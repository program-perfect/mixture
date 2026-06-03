"use client"

import * as React from "react"
import { FileBox, Download, Bug, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PROJECT_VERSION } from "@/lib/screenkit/data"
import { iconForCategory, appearanceIcon } from "./icons"
import { IconTile } from "./primitives"
import { useScreenkit } from "./store"
import type { CategoryId } from "@/lib/screenkit/types"

type ExtraItem = {
  id: string
  label: string
  icon: LucideIcon
  accent: string
  tint: string
  onClick: () => void
  active: boolean
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const {
    section,
    setSection,
    filters,
    setFilters,
    t,
    inserts,
    categories,
    catLabel,
  } = useScreenkit()

  const nav = (fn: () => void) => () => {
    fn()
    onNavigate?.()
  }

  const goCategory = (id: CategoryId) =>
    nav(() => {
      setFilters((f) => ({ ...f, category: id }))
      setSection("library")
    })

  const inLibraryAll = section === "library" && filters.category === "all"

  const extras: ExtraItem[] = [
    {
      id: "appearance",
      label: t("nav.appearance"),
      icon: appearanceIcon,
      accent: "var(--accent-blue)",
      tint: "rgba(47,128,237,0.14)",
      onClick: nav(() => setSection("style")),
      active: section === "style",
    },
    {
      id: "metadata",
      label: t("nav.metadata"),
      icon: FileBox,
      accent: "var(--accent-green)",
      tint: "rgba(34,197,94,0.14)",
      onClick: nav(() => setSection("prompts")),
      active: section === "prompts",
    },
    {
      id: "export",
      label: t("nav.export"),
      icon: Download,
      accent: "var(--accent-grey)",
      tint: "rgba(255,255,255,0.06)",
      onClick: nav(() => setSection("export")),
      active: section === "export",
    },
    {
      id: "nerds",
      label: t("nav.infoForNerds"),
      icon: Bug,
      accent: "var(--accent-grey)",
      tint: "rgba(255,255,255,0.06)",
      onClick: nav(() => setSection("about")),
      active: section === "about",
    },
  ]

  return (
    <aside className="flex h-full w-full flex-col bg-sidebar md:w-[320px] md:shrink-0">
      <div className="px-5 pt-5">
        <p className="font-mono text-xs lowercase text-text-faint">
          {PROJECT_VERSION}
        </p>
        <h2 className="mt-2 font-mono text-3xl font-bold lowercase text-foreground">
          {t(`section.${section}`)}
        </h2>
      </div>

      <ScrollArea className="mt-5 flex-1 sk-scroll">
        <div className="flex flex-col gap-1 px-3 pb-8">
          {/* appearance (settings) */}
          <SideRow
            label={extras[0].label}
            icon={extras[0].icon}
            accent={extras[0].accent}
            tint={extras[0].tint}
            active={extras[0].active}
            onClick={extras[0].onClick}
          />

          <Divider />

          {/* all inserts */}
          <button
            onClick={nav(() => {
              setFilters((f) => ({ ...f, category: "all" }))
              setSection("library")
            })}
            className={rowCls(inLibraryAll)}
          >
            <span
              className="flex size-9 items-center justify-center rounded-[10px] border border-panel-border font-mono text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              {inserts.length}
            </span>
            <span className="font-mono text-sm lowercase">
              {t("nav.allInserts")}
            </span>
          </button>

          {/* device categories */}
          {categories.map((cat) => {
            const Icon = iconForCategory(cat.id)
            const active = section === "library" && filters.category === cat.id
            const count = inserts.filter((i) => i.category === cat.id).length
            return (
              <button
                key={cat.id}
                onClick={goCategory(cat.id)}
                className={rowCls(active)}
              >
                <IconTile
                  icon={Icon}
                  accent={cat.accent}
                  tint={cat.tint}
                  active={active}
                />
                <span className="flex-1 text-left font-mono text-sm lowercase">
                  {catLabel(cat.id)}
                </span>
                <span className="font-mono text-xs text-text-faint">
                  {count}
                </span>
              </button>
            )
          })}

          <Divider />

          {extras.slice(1).map((x) => (
            <SideRow
              key={x.id}
              label={x.label}
              icon={x.icon}
              accent={x.accent}
              tint={x.tint}
              active={x.active}
              onClick={x.onClick}
            />
          ))}
        </div>
      </ScrollArea>
    </aside>
  )
}

function rowCls(active: boolean) {
  return cn(
    "flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors",
    active
      ? "bg-control-active text-control-active-foreground"
      : "text-foreground hover:bg-panel-hover",
  )
}

function SideRow({
  label,
  icon,
  accent,
  tint,
  active,
  onClick,
}: {
  label: string
  icon: LucideIcon
  accent: string
  tint: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button onClick={onClick} className={rowCls(active)}>
      <IconTile icon={icon} accent={accent} tint={tint} active={active} />
      <span className="font-mono text-sm lowercase">{label}</span>
    </button>
  )
}

function Divider() {
  return <div className="my-2 h-px bg-panel-border/70" />
}
