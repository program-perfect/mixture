"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PROJECT_VERSION } from "@/lib/screenkit/data"
import type { CategoryId } from "@/lib/screenkit/types"
import { iconForCategory } from "./icons"
import { IconTile, Pill } from "./primitives"
import { useScreenkit } from "./store"
import { useGradients } from "./theme"

/* ------------------------------------------------------------------ *
 * category navigation — now lives INSIDE the main area.
 *
 *   • tablet / pre-desktop / desktop (md+) -> vertical list (CategoryList)
 *   • pre-tablet / mobile (< md)           -> horizontal chip strip (CategoryChips)
 *
 * both drive the same state: pick a category -> open the library filtered.
 * ------------------------------------------------------------------ */

function useCategoryNav(onNavigate?: () => void) {
  const { section, setSection, filters, setFilters } = useScreenkit()

  const inLibraryAll = section === "library" && filters.category === "all"
  const isActive = (id: CategoryId) =>
    section === "library" && filters.category === id

  const goAll = () => {
    setFilters((f) => ({ ...f, category: "all" }))
    setSection("library")
    onNavigate?.()
  }
  const goCategory = (id: CategoryId) => {
    setFilters((f) => ({ ...f, category: id }))
    setSection("library")
    onNavigate?.()
  }

  return { inLibraryAll, isActive, goAll, goCategory }
}

/* --------------------------- desktop list panel --------------------------- */

export function CategoryPanel({
  className,
  onNavigate,
}: {
  className?: string
  onNavigate?: () => void
}) {
  const { t, inserts, categories, catLabel } = useScreenkit()
  const gradients = useGradients()
  const { inLibraryAll, isActive, goAll, goCategory } = useCategoryNav(onNavigate)

  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col border-r border-panel-border bg-background md:w-[236px] md:shrink-0",
        className,
      )}
    >
      <div className="flex items-center justify-between px-4 pt-5">
        <h2 className="font-mono text-xs font-medium uppercase tracking-wide text-text-faint">
          {t("nav.categories")}
        </h2>
        <span className="font-mono text-[10px] lowercase text-text-faint">
          {PROJECT_VERSION}
        </span>
      </div>

      <ScrollArea className="mt-3 flex-1 sk-scroll">
        <div className="flex flex-col gap-1 px-3 pb-8">
          {/* all inserts */}
          <button
            onClick={goAll}
            className={rowCls(inLibraryAll)}
            style={activeRowStyle(inLibraryAll, "var(--accent-grey)", gradients)}
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

          <div className="my-2 h-px bg-panel-border/70" />

          {categories.map((cat) => {
            const Icon = iconForCategory(cat.id)
            const active = isActive(cat.id)
            const count = inserts.filter((i) => i.category === cat.id).length
            return (
              <button
                key={cat.id}
                onClick={() => goCategory(cat.id)}
                className={rowCls(active)}
                style={activeRowStyle(active, cat.accent, gradients)}
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
                <span className="font-mono text-xs text-text-faint">{count}</span>
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </aside>
  )
}

/* --------------------------- mobile chip strip --------------------------- */

export function CategoryChips({ className }: { className?: string }) {
  const { t, inserts, categories, catLabel } = useScreenkit()
  const { inLibraryAll, isActive, goAll, goCategory } = useCategoryNav()

  return (
    <nav
      aria-label={t("nav.categories")}
      className={cn(
        "sk-chips -mx-5 flex items-center gap-2 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8",
        className,
      )}
    >
      <Pill active={inLibraryAll} onClick={goAll} className="shrink-0">
        {t("nav.allInserts")}
      </Pill>
      {categories.map((cat) => (
        <Pill
          key={cat.id}
          accent={cat.accent}
          active={isActive(cat.id)}
          onClick={() => goCategory(cat.id)}
          className="shrink-0"
        >
          {catLabel(cat.id)}
          <span className="text-text-faint">
            {inserts.filter((i) => i.category === cat.id).length}
          </span>
        </Pill>
      ))}
    </nav>
  )
}

/* ------------------------------- helpers ------------------------------- */

function rowCls(active: boolean) {
  return cn(
    "flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors",
    active
      ? "text-foreground"
      : "text-foreground hover:bg-panel-hover",
  )
}

/* selected rows get a subtle single-hue accent wash (gradient when enabled) */
function activeRowStyle(
  active: boolean,
  accent: string,
  gradients: ReturnType<typeof useGradients>,
): React.CSSProperties | undefined {
  if (!active) return undefined
  if (gradients === "off") {
    return { background: `color-mix(in srgb, ${accent} 14%, transparent)` }
  }
  const strong = gradients === "vivid" ? 26 : 20
  return {
    background: `linear-gradient(120deg, color-mix(in srgb, ${accent} ${strong}%, transparent), color-mix(in srgb, ${accent} 6%, transparent))`,
  }
}
