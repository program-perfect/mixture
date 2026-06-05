"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { LayoutGrid, List, Rows3 } from "lucide-react"
import * as React from "react"
import {
    LIBRARY_LIST_UI,
    LIBRARY_PAGE_SIZE_OPTIONS,
    librarySortOptions,
    libraryViewOptions,
    type LibraryPageSize,
    type LibrarySortKey,
    type LibraryViewMode,
} from "./library-list-settings"
import { Explain, SectionHeading } from "./primitives"
import { useScreenkit } from "./store"

type LibraryListControlsVariant = "settings" | "toolbar"

export function LibraryListControls({
  variant = "settings",
  className,
}: {
  variant?: LibraryListControlsVariant
  className?: string
}) {
  const { locale, libraryListSettings, setLibraryListSettings } = useScreenkit()
  const labels = LIBRARY_LIST_UI[locale]
  const sortOptions = librarySortOptions(locale)
  const viewOptions = libraryViewOptions(locale)

  const setSort = (sort: LibrarySortKey) =>
    setLibraryListSettings((settings) => ({ ...settings, sort }))

  const setView = (view: LibraryViewMode) =>
    setLibraryListSettings((settings) => ({ ...settings, view }))

  const setPageSize = (pageSize: LibraryPageSize) =>
    setLibraryListSettings((settings) => ({ ...settings, pageSize }))

  if (variant === "toolbar") {
    return (
      <div
        className={cn(
          "flex min-w-0 flex-col gap-3 rounded-2xl border border-panel-border bg-panel-soft p-3 md:flex-row md:flex-wrap md:items-center md:justify-between",
          className,
        )}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <ControlLabel>{labels.sort}</ControlLabel>
          <Select
            value={libraryListSettings.sort}
            onValueChange={(value) => setSort(value as LibrarySortKey)}
          >
            <SelectTrigger className="h-9 w-[min(100vw-3rem,13rem)] rounded-xl border-panel-border bg-control font-mono text-xs lowercase text-foreground sm:w-[13rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="font-mono text-xs lowercase"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ControlLabel>{labels.pageSize}</ControlLabel>
          <Select
            value={String(libraryListSettings.pageSize)}
            onValueChange={(value) => setPageSize(Number(value) as LibraryPageSize)}
          >
            <SelectTrigger className="h-9 w-[min(100vw-3rem,13rem)] rounded-xl border-panel-border bg-control font-mono text-xs lowercase text-foreground sm:w-[13rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIBRARY_PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem
                  key={size}
                  value={String(size)}
                  className="font-mono text-xs lowercase"
                >
                  {size} {labels.perPage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <ControlLabel>{labels.view}</ControlLabel>
          {viewOptions.map((option) => (
            <ViewButton
              key={option.value}
              active={libraryListSettings.view === option.value}
              onClick={() => setView(option.value)}
              icon={viewIcon(option.value)}
              compact
            >
              <span className="hidden sm:inline">{option.label}</span>
            </ViewButton>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-6 rounded-3xl border border-panel-border bg-panel-soft p-4 sm:p-5",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-3">
        <SectionHeading title={labels.sortingTitle} />
        <Select
          value={libraryListSettings.sort}
          onValueChange={(value) => setSort(value as LibrarySortKey)}
        >
          <SelectTrigger className="h-10 w-full rounded-xl border-panel-border bg-control font-mono text-xs lowercase text-foreground sm:w-[280px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="font-mono text-xs lowercase"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Explain>{labels.sortingDesc}</Explain>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <SectionHeading title={labels.displayTitle} />
        <div className="flex flex-wrap gap-2">
          {viewOptions.map((option) => (
            <ViewButton
              key={option.value}
              active={libraryListSettings.view === option.value}
              onClick={() => setView(option.value)}
              icon={viewIcon(option.value)}
            >
              {option.label}
            </ViewButton>
          ))}
        </div>
        <Explain>{labels.displayDesc}</Explain>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <SectionHeading title={labels.paginationTitle} />
        <Select
          value={String(libraryListSettings.pageSize)}
          onValueChange={(value) => setPageSize(Number(value) as LibraryPageSize)}
        >
          <SelectTrigger className="h-10 w-full rounded-xl border-panel-border bg-control font-mono text-xs lowercase text-foreground sm:w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LIBRARY_PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem
                key={size}
                value={String(size)}
                className="font-mono text-xs lowercase"
              >
                {size} {labels.perPage}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Explain>{labels.paginationDesc}</Explain>
      </div>
    </div>
  )
}

function ViewButton({
  active,
  compact,
  icon,
  children,
  onClick,
}: {
  active: boolean
  compact?: boolean
  icon: React.ReactNode
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-2 rounded-full border font-mono text-xs lowercase transition-colors",
        compact ? "h-9 px-3" : "h-10 px-4",
        active
          ? "border-transparent bg-control-active text-control-active-foreground"
          : "border-panel-border bg-control text-text-secondary hover:bg-panel-hover hover:text-foreground",
      )}
    >
      {icon}
      {children}
    </button>
  )
}

function ControlLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[11px] lowercase text-text-faint">
      {children}
    </span>
  )
}

function viewIcon(view: LibraryViewMode) {
  if (view === "compact") return <List className="size-3.5" />
  if (view === "grid") return <LayoutGrid className="size-3.5" />
  return <Rows3 className="size-3.5" />
}
