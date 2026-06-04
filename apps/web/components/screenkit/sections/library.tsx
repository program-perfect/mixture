"use client"

import { Input } from "@/components/ui/input"
import { DEVICES, STATUSES, resolveInsert } from "@/lib/screenkit/data"
import { deviceLabel, statusLabel } from "@/lib/screenkit/i18n"
import type { Locale, ResolvedInsert } from "@/lib/screenkit/types"
import { cn } from "@/lib/utils"
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
} from "lucide-react"
import * as React from "react"
import { iconForDevice } from "../icons"
import {
  LIBRARY_LIST_UI,
  compareLibraryInserts,
} from "../library-list-settings"
import { LibraryEditor } from "../library-editor"
import { staggerDelay } from "../motion"
import { MotionNumber } from "../motion-number"
import {
  Explain,
  IconTile,
  Pill,
  RuOnlyBadge,
  SectionHeading,
  StatusBadge,
} from "../primitives"
import { useScreenkit } from "../store"
import type { LibraryViewMode } from "../library-list-settings"

export function LibrarySection() {
  const {
    filters,
    setFilters,
    openInPreview,
    locale,
    t,
    inserts,
    categories,
    catDef,
    catLabel,
    libraryListSettings,
  } = useScreenkit()

  const labels = LIBRARY_LIST_UI[locale]
  const { sort: sortKey, view: viewMode, pageSize } = libraryListSettings
  const [page, setPage] = React.useState(1)

  const filtered = React.useMemo(
    () =>
      inserts.filter((i) => {
        if (filters.category !== "all" && i.category !== filters.category) return false
        if (filters.device !== "all" && i.device !== filters.device) return false
        if (filters.status !== "all" && i.status !== filters.status) return false
        if (filters.search) {
          const q = filters.search.toLowerCase()
          const r = resolveInsert(i, locale)
          const hay =
            `${i.title.ru} ${i.title.en ?? ""} ${r.title} ${r.description} ${i.episode} ${i.scene} ${i.id}`.toLowerCase()
          if (!hay.includes(q)) return false
        }
        return true
      }),
    [filters, inserts, locale],
  )

  const sorted = React.useMemo(
    () =>
      filtered
        .map((raw) => resolveInsert(raw, locale))
        .sort((a, b) => compareLibraryInserts(a, b, sortKey)),
    [filtered, locale, sortKey],
  )

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, pageCount)
  const pageStart = (safePage - 1) * pageSize
  const pageEnd = Math.min(pageStart + pageSize, sorted.length)

  const paged = React.useMemo(
    () => sorted.slice(pageStart, pageStart + pageSize),
    [pageSize, pageStart, sorted],
  )

  React.useEffect(() => {
    setPage(1)
  }, [filters, sortKey, pageSize])

  React.useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [page, pageCount])

  return (
    <div className="flex min-w-0 flex-col gap-7">
      <header className="flex min-w-0 flex-col gap-3">
        <SectionHeading title={t("library.title")} />
        <Explain>{t("library.desc")}</Explain>
        <LibraryEditor />
      </header>

      <div className="relative min-w-0">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-faint" />
        <Input
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          placeholder={t("library.search")}
          className="h-11 rounded-2xl border-panel-border bg-control pl-9 font-mono text-sm text-foreground placeholder:text-text-faint focus-visible:ring-ring"
        />
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <FilterRow label={t("library.category")}>
          <Pill active={filters.category === "all"} onClick={() => setFilters((f) => ({ ...f, category: "all" }))}>
            {t("library.all")}
          </Pill>
          {categories.map((c) => (
            <Pill
              key={c.id}
              accent={c.accent}
              active={filters.category === c.id}
              onClick={() => setFilters((f) => ({ ...f, category: c.id }))}
            >
              {catLabel(c.id)}
            </Pill>
          ))}
        </FilterRow>

        <FilterRow label={t("library.device")}>
          <Pill active={filters.device === "all"} onClick={() => setFilters((f) => ({ ...f, device: "all" }))}>
            {t("library.all")}
          </Pill>
          {DEVICES.map((d) => (
            <Pill
              key={d.id}
              active={filters.device === d.id}
              onClick={() => setFilters((f) => ({ ...f, device: d.id }))}
            >
              {deviceLabel(d.id, locale)}
            </Pill>
          ))}
        </FilterRow>

        <FilterRow label={t("library.status")}>
          <Pill active={filters.status === "all"} onClick={() => setFilters((f) => ({ ...f, status: "all" }))}>
            {t("library.all")}
          </Pill>
          {STATUSES.map((s) => (
            <Pill
              key={s.id}
              accent={s.accent}
              active={filters.status === s.id}
              onClick={() => setFilters((f) => ({ ...f, status: s.id }))}
            >
              {statusLabel(s.id, locale)}
            </Pill>
          ))}
        </FilterRow>
      </div>

      <div className="flex min-w-0 flex-col gap-2 border-b border-panel-border pb-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-mono text-xs lowercase text-text-muted">
          <MotionNumber value={filtered.length} />{" "}
          {filtered.length === 1 ? t("library.countOne") : t("library.countMany")}
          {sorted.length > 0 && (
            <>
              {" · "}
              {labels.showing}{" "}
              <MotionNumber value={pageStart + 1} />–<MotionNumber value={pageEnd} />{" "}
              {labels.of} <MotionNumber value={sorted.length} />
            </>
          )}
        </span>
        <span className="font-mono text-xs text-text-faint">
          {t("library.dateEpisodeScene")}
        </span>
      </div>

      <ul className={listCls(viewMode)}>
        {paged.map((insert, idx) => (
          <li key={insert.id} className="min-w-0 sk-animate-in" style={staggerDelay(idx)}>
            <InsertCard
              insert={insert}
              locale={locale}
              viewMode={viewMode}
              categoryAccent={catDef(insert.category)?.accent ?? "var(--accent-grey)"}
              categoryTint={catDef(insert.category)?.tint ?? "rgba(255,255,255,0.06)"}
              categoryLabel={catLabel(insert.category)}
              onPreview={() => openInPreview(insert.id)}
              previewLabel={t("library.preview")}
              ruOnlyLabel={t("common.ruOnly")}
              ruOnlyHint={t("common.ruOnlyHint")}
            />
          </li>
        ))}

        {filtered.length === 0 && (
          <li className="rounded-2xl border border-dashed border-panel-border p-8 text-center font-mono text-sm text-text-muted">
            {t("library.empty")}
          </li>
        )}
      </ul>

      {sorted.length > pageSize && (
        <PaginationBar
          page={safePage}
          pageCount={pageCount}
          onPageChange={setPage}
          label={labels.page}
        />
      )}
    </div>
  )
}

function InsertCard({
  insert,
  locale,
  viewMode,
  categoryAccent,
  categoryTint,
  categoryLabel,
  onPreview,
  previewLabel,
  ruOnlyLabel,
  ruOnlyHint,
}: {
  insert: ResolvedInsert
  locale: Locale
  viewMode: LibraryViewMode
  categoryAccent: string
  categoryTint: string
  categoryLabel: string
  onPreview: () => void
  previewLabel: string
  ruOnlyLabel: string
  ruOnlyHint: string
}) {
  const Icon = iconForDevice(insert.device)

  return (
    <button type="button" onClick={onPreview} className={cardCls(viewMode)}>
      <IconTile
        icon={Icon}
        accent={categoryAccent}
        tint={categoryTint}
        size={viewMode === "compact" ? 34 : 40}
      />

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="min-w-0 truncate font-mono text-sm lowercase text-foreground">
            {insert.title}
          </span>
          <StatusBadge status={insert.status} label={statusLabel(insert.status, locale)} />
          {!insert.hasEnglish && (
            <RuOnlyBadge label={ruOnlyLabel} title={ruOnlyHint} />
          )}
        </div>

        {viewMode !== "compact" && (
          <p className="mt-1 line-clamp-2 font-mono text-[12px] leading-relaxed text-text-muted">
            {insert.description}
          </p>
        )}

        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] text-text-faint sm:gap-x-3">
          <span>{insert.date}</span>
          <span>· {insert.episode}</span>
          <span>· {insert.scene}</span>
          <span>· {deviceLabel(insert.device, locale)}</span>
          <span>· {categoryLabel}</span>
          <span>· {insert.aspect}</span>
        </div>
      </div>

      {viewMode !== "grid" && (
        <span className="hidden shrink-0 items-center gap-1 self-center rounded-full bg-control px-3 py-1.5 font-mono text-[11px] lowercase text-text-secondary group-hover:bg-control-active group-hover:text-control-active-foreground sm:flex">
          <Eye className="size-3.5" /> {previewLabel}
          <ArrowUpRight className="size-3" />
        </span>
      )}
    </button>
  )
}

function PaginationBar({
  page,
  pageCount,
  onPageChange,
  label,
}: {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  label: string
}) {
  const pages = paginationWindow(page, pageCount)

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2" aria-label={label}>
      <PaginationButton
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="previous page"
      >
        <ChevronLeft className="size-3.5" />
      </PaginationButton>

      {pages.map((item, index) =>
        item === "dots" ? (
          <span key={`dots-${index}`} className="px-1 font-mono text-xs text-text-faint">
            …
          </span>
        ) : (
          <PaginationButton
            key={item}
            active={item === page}
            onClick={() => onPageChange(item)}
            aria-label={`${label} ${item}`}
          >
            {item}
          </PaginationButton>
        ),
      )}

      <PaginationButton
        onClick={() => onPageChange(Math.min(pageCount, page + 1))}
        disabled={page === pageCount}
        aria-label="next page"
      >
        <ChevronRight className="size-3.5" />
      </PaginationButton>
    </nav>
  )
}

function PaginationButton({
  active,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-8 min-w-8 items-center justify-center rounded-full border border-panel-border px-2 font-mono text-xs lowercase transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        active
          ? "bg-control-active text-control-active-foreground"
          : "bg-control text-text-secondary hover:bg-panel-hover hover:text-foreground",
        className,
      )}
      {...props}
    />
  )
}

function FilterRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid min-w-0 gap-2 sm:grid-cols-[5rem_minmax(0,1fr)] sm:items-start">
      <span className="pt-2 font-mono text-[11px] lowercase text-text-faint">
        {label}
      </span>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        {children}
      </div>
    </div>
  )
}

function paginationWindow(page: number, pageCount: number): Array<number | "dots"> {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, idx) => idx + 1)

  const pages = new Set([1, pageCount, page - 1, page, page + 1])
  const sorted = [...pages]
    .filter((item) => item >= 1 && item <= pageCount)
    .sort((a, b) => a - b)

  return sorted.flatMap((item, index) => {
    const previous = sorted[index - 1]
    if (previous && item - previous > 1) return ["dots" as const, item]
    return [item]
  })
}

function listCls(viewMode: LibraryViewMode) {
  if (viewMode === "grid") {
    return "grid min-w-0 gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))]"
  }

  return "flex min-w-0 flex-col gap-2"
}

function cardCls(viewMode: LibraryViewMode) {
  const base =
    "group w-full min-w-0 rounded-2xl border border-panel-border bg-panel-soft text-left transition-colors hover:border-ring hover:bg-panel-hover"

  if (viewMode === "compact") {
    return cn(base, "flex items-center gap-3 p-2.5")
  }

  if (viewMode === "grid") {
    return cn(base, "flex h-full flex-col gap-3 p-3")
  }

  return cn(base, "flex items-start gap-3 p-3")
}
