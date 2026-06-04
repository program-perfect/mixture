"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { PROJECT_VERSION } from "@/lib/screenkit/data"
import type { CategoryId } from "@/lib/screenkit/types"
import { cn } from "@/lib/utils"
import { GripVertical, LayoutGrid } from "lucide-react"
import * as React from "react"
import { categoryIconFor } from "./icons"
import { MotionNumber } from "./motion-number"
import { IconTile, Pill } from "./primitives"
import { useScreenkit } from "./store"
import { useGradients } from "./theme"

/* ------------------------------------------------------------------ *
 * category navigation lives inside the main area.
 *
 *   • phone / tablet / pre-desktop (< xl) -> horizontal chip strip
 *   • wide desktop (xl+)                 -> resizable vertical panel
 *
 * resize rules:
 *   • max width = 1/3 of the main content area, excluding the left rail
 *   • if text no longer fits comfortably, panel magnet-collapses to icon-only
 *   • icon-only mode keeps only icon margins/padding, no labels/counters
 * ------------------------------------------------------------------ */

const CATEGORY_PANEL_WIDTH_KEY = "screenkit-category-panel-width"
const ICON_ONLY_WIDTH = 68
const DEFAULT_WIDTH = 236
const MIN_READABLE_WIDTH_FALLBACK = 196
const MAX_WIDTH_FALLBACK = 360

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

function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false)

  React.useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)

    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [query])

  return matches
}

function useCategoryPanelSize(labels: string[]) {
  const panelRef = React.useRef<HTMLElement | null>(null)
  const measureRef = React.useRef<HTMLDivElement | null>(null)

  // Match the CSS visibility breakpoint in Content: CategoryPanel is xl:flex.
  const isDesktopPanel = useMediaQuery("(min-width: 1280px)")
  const [rawWidth, setRawWidth] = React.useState(DEFAULT_WIDTH)
  const [mainWidth, setMainWidth] = React.useState(0)
  const [readableMinWidth, setReadableMinWidth] = React.useState(
    MIN_READABLE_WIDTH_FALLBACK,
  )
  const [isDragging, setIsDragging] = React.useState(false)

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CATEGORY_PANEL_WIDTH_KEY)
      if (!stored) return

      const value = Number(stored)
      if (Number.isFinite(value)) setRawWidth(value)
    } catch {
      // ignore
    }
  }, [])

  React.useLayoutEffect(() => {
    if (!isDesktopPanel) return

    const panel = panelRef.current
    const container = panel?.parentElement
    if (!container) return

    const observer = new ResizeObserver(([entry]) => {
      setMainWidth(entry.contentRect.width)
    })

    observer.observe(container)
    setMainWidth(container.getBoundingClientRect().width)

    return () => observer.disconnect()
  }, [isDesktopPanel])

  React.useLayoutEffect(() => {
    const node = measureRef.current
    if (!node) return

    const labelWidths = Array.from(
      node.querySelectorAll<HTMLElement>("[data-label]"),
    ).map((el) => Math.ceil(el.getBoundingClientRect().width))

    const widestLabel = Math.max(0, ...labelWidths)

    // row math: icon 40 + gap 12 + label + counter 28 + horizontal padding 20
    // plus a little breathing room so the label does not sit tight against count.
    const next = Math.max(
      MIN_READABLE_WIDTH_FALLBACK,
      Math.ceil(widestLabel + 112),
    )

    setReadableMinWidth(next)
  }, [labels])

  const maxWidth = React.useMemo(() => {
    if (!isDesktopPanel) return DEFAULT_WIDTH
    if (mainWidth <= 0) return MAX_WIDTH_FALLBACK

    // Content already excludes the left rail, so this is 1/3 of the remaining
    // main area. It is intentionally capped by the current viewport/container.
    return Math.max(ICON_ONLY_WIDTH, Math.floor(mainWidth / 3))
  }, [isDesktopPanel, mainWidth])

  const shouldCollapse =
    isDesktopPanel &&
    (rawWidth < readableMinWidth || maxWidth < readableMinWidth)

  const width = React.useMemo(() => {
    if (!isDesktopPanel) return undefined
    if (shouldCollapse) return ICON_ONLY_WIDTH

    return clamp(rawWidth, readableMinWidth, maxWidth)
  }, [isDesktopPanel, maxWidth, rawWidth, readableMinWidth, shouldCollapse])

  const persistWidth = React.useCallback((value: number) => {
    try {
      window.localStorage.setItem(CATEGORY_PANEL_WIDTH_KEY, String(value))
    } catch {
      // ignore
    }
  }, [])

  const setMagneticWidth = React.useCallback(
    (value: number) => {
      const next =
        value < readableMinWidth
          ? ICON_ONLY_WIDTH
          : clamp(value, readableMinWidth, maxWidth)

      setRawWidth(next)
      persistWidth(next)
    },
    [maxWidth, persistWidth, readableMinWidth],
  )

  const onPointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!isDesktopPanel) return

      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)

      const startX = event.clientX
      const startWidth = width ?? rawWidth

      setIsDragging(true)

      const onPointerMove = (moveEvent: PointerEvent) => {
        const delta = moveEvent.clientX - startX
        setMagneticWidth(startWidth + delta)
      }

      const onPointerUp = () => {
        setIsDragging(false)
        window.removeEventListener("pointermove", onPointerMove)
        window.removeEventListener("pointerup", onPointerUp)
      }

      window.addEventListener("pointermove", onPointerMove)
      window.addEventListener("pointerup", onPointerUp)
    },
    [isDesktopPanel, rawWidth, setMagneticWidth, width],
  )

  const onResizeKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (!isDesktopPanel) return

      if (event.key === "ArrowLeft") {
        event.preventDefault()
        setMagneticWidth((width ?? rawWidth) - 16)
      }

      if (event.key === "ArrowRight") {
        event.preventDefault()
        setMagneticWidth((width ?? rawWidth) + 16)
      }

      if (event.key === "Home") {
        event.preventDefault()
        setMagneticWidth(ICON_ONLY_WIDTH)
      }

      if (event.key === "End") {
        event.preventDefault()
        setMagneticWidth(maxWidth)
      }
    },
    [isDesktopPanel, maxWidth, rawWidth, setMagneticWidth, width],
  )

  const onResizeDoubleClick = React.useCallback(() => {
    if (!isDesktopPanel) return

    setMagneticWidth(shouldCollapse ? DEFAULT_WIDTH : ICON_ONLY_WIDTH)
  }, [isDesktopPanel, setMagneticWidth, shouldCollapse])

  return {
    panelRef,
    measureRef,
    isDesktopPanel,
    isCollapsed: shouldCollapse,
    isDragging,
    width,
    maxWidth,
    readableMinWidth,
    onPointerDown,
    onResizeKeyDown,
    onResizeDoubleClick,
  }
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

  const labels = React.useMemo(
    () => [t("nav.allInserts"), ...categories.map((cat) => catLabel(cat.id))],
    [catLabel, categories, t],
  )

  const {
    panelRef,
    measureRef,
    isDesktopPanel,
    isCollapsed,
    isDragging,
    width,
    maxWidth,
    readableMinWidth,
    onPointerDown,
    onResizeKeyDown,
    onResizeDoubleClick,
  } = useCategoryPanelSize(labels)

  return (
    <aside
      ref={panelRef}
      className={cn(
        "sk-resize relative flex h-full w-full min-w-0 flex-col overflow-hidden border-r border-panel-border bg-background xl:shrink-0",
        isCollapsed && "items-center",
        className,
      )}
      style={{
        width,
        minWidth: isDesktopPanel ? width : undefined,
        maxWidth: isDesktopPanel ? maxWidth : undefined,
        transition: isDragging ? "none" : undefined,
      }}
    >
      <div
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none fixed -left-[9999px] top-0 flex flex-col font-mono text-sm lowercase opacity-0"
      >
        {labels.map((label) => (
          <span key={label} data-label>
            {label}
          </span>
        ))}
      </div>

      <div
        className={cn(
          "flex items-center justify-between px-4 pt-5",
          isCollapsed && "justify-center px-2",
        )}
      >
        {isCollapsed ? (
          <span
            className="size-1.5 rounded-full"
            style={{ background: "var(--accent-grey)" }}
            title={t("nav.categories")}
          />
        ) : (
          <>
            <h2 className="font-mono text-xs font-medium uppercase tracking-wide text-text-faint">
              {t("nav.categories")}
            </h2>
            <span className="font-mono text-[10px] lowercase text-text-faint">
              {PROJECT_VERSION}
            </span>
          </>
        )}
      </div>

      <ScrollArea className="mt-3 flex-1 sk-scroll">
        <div
          className={cn(
            "flex flex-col gap-1 px-3 pb-8",
            isCollapsed && "items-center px-2",
          )}
        >
          <button
            type="button"
            onClick={goAll}
            className={rowCls(inLibraryAll, isCollapsed)}
            style={activeRowStyle(inLibraryAll, "var(--accent-grey)", gradients)}
            title={isCollapsed ? t("nav.allInserts") : undefined}
            aria-label={t("nav.allInserts")}
          >
            {isCollapsed ? (
              <span className="flex size-10 items-center justify-center rounded-[10px] border border-panel-border text-text-secondary">
                <LayoutGrid className="size-4" />
              </span>
            ) : (
              <>
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-panel-border font-mono text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <MotionNumber value={inserts.length} />
                </span>
                <span className="min-w-0 truncate font-mono text-sm lowercase">
                  {t("nav.allInserts")}
                </span>
              </>
            )}
          </button>

          <div
            className={cn(
              "my-2 h-px bg-panel-border/70",
              isCollapsed ? "w-9" : "w-full",
            )}
          />

          {categories.map((cat) => {
            const Icon = categoryIconFor(cat)
            const active = isActive(cat.id)
            const count = inserts.filter((i) => i.category === cat.id).length
            const label = catLabel(cat.id)

            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => goCategory(cat.id)}
                className={rowCls(active, isCollapsed)}
                style={activeRowStyle(active, cat.accent, gradients)}
                title={isCollapsed ? label : undefined}
                aria-label={label}
              >
                <IconTile
                  icon={Icon}
                  accent={cat.accent}
                  tint={cat.tint}
                  active={active}
                />

                {!isCollapsed && (
                  <>
                    <span className="min-w-0 flex-1 truncate text-left font-mono text-sm lowercase">
                      {label}
                    </span>
                    <MotionNumber
                      value={count}
                      className="font-mono text-xs text-text-faint"
                    />
                  </>
                )}
              </button>
            )
          })}
        </div>
      </ScrollArea>

      {isDesktopPanel && (
        <button
          type="button"
          role="separator"
          aria-orientation="vertical"
          aria-label="изменить ширину панели категорий"
          aria-valuemin={ICON_ONLY_WIDTH}
          aria-valuemax={maxWidth}
          aria-valuenow={width}
          className="group absolute right-0 top-0 z-10 flex h-full w-4 translate-x-1/2 cursor-col-resize items-center justify-center outline-none"
          onPointerDown={onPointerDown}
          onKeyDown={onResizeKeyDown}
          onDoubleClick={onResizeDoubleClick}
          title={`drag: ${ICON_ONLY_WIDTH}–${maxWidth}px, text min: ${readableMinWidth}px`}
        >
          <span className="flex h-12 w-3 items-center justify-center rounded-full border border-panel-border bg-panel-soft text-text-faint opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            <GripVertical className="size-3" />
          </span>
        </button>
      )}
    </aside>
  )
}

/* --------------------------- mobile chip strip --------------------------- */

export function CategoryChips({ className }: { className?: string }) {
  const { t, inserts, categories, catLabel } = useScreenkit()
  const { inLibraryAll, isActive, goAll, goCategory } = useCategoryNav()

  return (
    <div className={cn("relative min-w-0 overflow-hidden", className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[clamp(1.25rem,5vw,3rem)] bg-gradient-to-r from-background via-background/80 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[clamp(1.25rem,5vw,3rem)] bg-gradient-to-l from-background via-background/80 to-transparent" />

      <nav
        aria-label={t("nav.categories")}
        className="min-w-0 snap-x snap-mandatory overflow-x-auto overscroll-x-contain px-4 pb-1 [scroll-padding-inline:1rem] [scrollbar-width:none] [-webkit-overflow-scrolling:touch] sm:px-6 md:px-8 [&::-webkit-scrollbar]:hidden"
      >
        <div className="mx-auto flex w-max max-w-full items-center gap-2">
          <Pill
            active={inLibraryAll}
            onClick={goAll}
            className="shrink-0 snap-center whitespace-nowrap"
          >
            {t("nav.allInserts")}
          </Pill>

          {categories.map((cat) => (
            <Pill
              key={cat.id}
              accent={cat.accent}
              active={isActive(cat.id)}
              onClick={() => goCategory(cat.id)}
              className="shrink-0 snap-center whitespace-nowrap"
            >
              {catLabel(cat.id)}
              <MotionNumber
                value={inserts.filter((i) => i.category === cat.id).length}
                className="text-text-faint"
              />
            </Pill>
          ))}
        </div>
      </nav>
    </div>
  )
}

/* ------------------------------- helpers ------------------------------- */

function rowCls(active: boolean, collapsed: boolean) {
  return cn(
    "flex min-w-0 items-center rounded-xl transition-colors",
    collapsed ? "justify-center p-1.5" : "gap-3 px-2.5 py-2.5",
    active ? "text-foreground" : "text-foreground hover:bg-panel-hover",
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
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
