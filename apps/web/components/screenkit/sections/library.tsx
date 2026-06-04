"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DEVICES, STATUSES, resolveInsert } from "@/lib/screenkit/data"
import { deviceLabel, statusLabel } from "@/lib/screenkit/i18n"
import type { Locale, ResolvedInsert } from "@/lib/screenkit/types"
import { cn } from '@/lib/utils'
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  LayoutGrid,
  List,
  Rows3,
  Search,
} from "lucide-react"
import * as React from "react"
import { iconForDevice } from "../icons"
import { LibraryEditor } from "../library-editor"
import { staggerDelay } from "../motion"
import { MotionNumber } from '../motion-number'
import {
  Explain,
  IconTile,
  Pill,
  RuOnlyBadge,
  SectionHeading,
  StatusBadge,
} from "../primitives"
import { useScreenkit } from "../store"

const PAGE_SIZE_OPTIONS = [6, 12, 24] as const

type PageSize = (typeof PAGE_SIZE_OPTIONS)[number]
type SortKey =
  | "date-desc"
  | "date-asc"
  | "episode-asc"
  | "episode-desc"
  | "title-asc"
  | "title-desc"
  | "status-asc"

type ViewMode = "cards" | "compact" | "grid"

const LIST_UI: Record<
  Locale,
  {
    sort: string
    view: string
    pageSize: string
    perPage: string
    showing: string
    of: string
    page: string
    sortOptions: Record<SortKey, string>
    viewOptions: Record<ViewMode, string>
  }
> = {
  ru: {
    sort: "сортировка",
    view: "вид",
    pageSize: "на странице",
    perPage: "шт.",
    showing: "показаны",
    of: "из",
    page: "страница",
    sortOptions: {
      "date-desc": "дата ↓",
      "date-asc": "дата ↑",
      "episode-asc": "серия / сцена ↑",
      "episode-desc": "серия / сцена ↓",
      "title-asc": "название а-я",
      "title-desc": "название я-а",
      "status-asc": "статус",
    },
    viewOptions: {
      cards: "плашки",
      compact: "компактно",
      grid: "сетка",
    },
  },
  en: {
    sort: "sort",
    view: "view",
    pageSize: "per page",
    perPage: "items",
    showing: "showing",
    of: "of",
    page: "page",
    sortOptions: {
      "date-desc": "date ↓",
      "date-asc": "date ↑",
      "episode-asc": "episode / scene ↑",
      "episode-desc": "episode / scene ↓",
      "title-asc": "title a-z",
      "title-desc": "title z-a",
      "status-asc": "status",
    },
    viewOptions: {
      cards: "cards",
      compact: "compact",
      grid: "grid",
    },
  },
}

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
  } = useScreenkit()

  const labels = LIST_UI[locale]
  const [sortKey, setSortKey] = React.useState<SortKey>("date-desc")
  const [viewMode, setViewMode] = React.useState<ViewMode>("cards")
  const [pageSize, setPageSize] = React.useState<PageSize>(12)
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
        .sort((a, b) => compareInserts(a, b, sortKey)),
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
    <div className="flex flex-col gap-7">
      <header className="flex flex-col gap-3">
        <SectionHeading title={t("library.title")} />
        <Explain>{t("library.desc")}</Explain>
        <LibraryEditor />
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-faint" />
        <Input
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          placeholder={t("library.search")}
          className="h-11 rounded-2xl border-panel-border bg-control pl-9 font-mono text-sm text-foreground placeholder:text-text-faint focus-visible:ring-ring"
        />
      </div>

      <div className="flex flex-col gap-3">
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

      <div className="flex flex-col gap-3 rounded-2xl border border-panel-border bg-panel-soft p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <ControlLabel>{labels.sort}</ControlLabel>
          <Select value={sortKey} onValueChange={(value) => setSortKey(value as SortKey)}>
            <SelectTrigger className="h-9 rounded-xl border-panel-border bg-control font-mono text-xs lowercase text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(labels.sortOptions) as SortKey[]).map((key) => (
                <SelectItem key={key} value={key} className="font-mono text-xs lowercase">
                  {labels.sortOptions[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ControlLabel>{labels.pageSize}</ControlLabel>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => setPageSize(Number(value) as PageSize)}
          >
            <SelectTrigger className="h-9 rounded-xl border-panel-border bg-control font-mono text-xs lowercase text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)} className="font-mono text-xs lowercase">
                  {size} {labels.perPage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ControlLabel>{labels.view}</ControlLabel>
          {(Object.keys(labels.viewOptions) as ViewMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={viewButtonCls(viewMode === mode)}
              aria-pressed={viewMode === mode}
              title={labels.viewOptions[mode]}
            >
              {mode === "cards" && <Rows3 className="size-3.5" />}
              {mode === "compact" && <List className="size-3.5" />}
              {mode === "grid" && <LayoutGrid className="size-3.5" />}
              <span className="hidden sm:inline">{labels.viewOptions[mode]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-b border-panel-border pb-2 sm:flex-row sm:items-center sm:justify-between">
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
          <li key={insert.id} className="sk-animate-in" style={staggerDelay(idx)}>
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
  viewMode: ViewMode
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
    <button onClick={onPreview} className={cardCls(viewMode)}>
      <IconTile
        icon={Icon}
        accent={categoryAccent}
        tint={categoryTint}
        size={viewMode === "compact" ? 34 : 40}
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-mono text-sm lowercase text-foreground">
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

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-text-faint">
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
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-16 shrink-0 font-mono text-[11px] lowercase text-text-faint">
        {label}
      </span>
      {children}
    </div>
  )
}

function ControlLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[11px] lowercase text-text-faint">
      {children}
    </span>
  )
}

function compareInserts(a: ResolvedInsert, b: ResolvedInsert, sortKey: SortKey) {
  switch (sortKey) {
    case "date-asc":
      return dateValue(a.date) - dateValue(b.date) || compareEpisodeScene(a, b)
    case "date-desc":
      return dateValue(b.date) - dateValue(a.date) || compareEpisodeScene(a, b)
    case "episode-asc":
      return compareEpisodeScene(a, b)
    case "episode-desc":
      return compareEpisodeScene(b, a)
    case "title-asc":
      return a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
    case "title-desc":
      return b.title.localeCompare(a.title, undefined, { sensitivity: "base" })
    case "status-asc":
      return a.status.localeCompare(b.status) || compareEpisodeScene(a, b)
    default:
      return 0
  }
}

function compareEpisodeScene(a: ResolvedInsert, b: ResolvedInsert) {
  return (
    numberFromText(a.episode) - numberFromText(b.episode) ||
    numberFromText(a.scene) - numberFromText(b.scene) ||
    a.id.localeCompare(b.id)
  )
}

function dateValue(date: string) {
  const value = Date.parse(date)
  return Number.isNaN(value) ? 0 : value
}

function numberFromText(value: string) {
  const number = value.match(/\d+/g)?.at(-1)
  return number ? Number(number) : 0
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

function listCls(viewMode: ViewMode) {
  if (viewMode === "grid") return "grid gap-3 sm:grid-cols-2"
  return "flex flex-col gap-2"
}

function cardCls(viewMode: ViewMode) {
  const base =
    "group w-full rounded-2xl border border-panel-border bg-panel-soft text-left transition-colors hover:border-ring hover:bg-panel-hover"

  if (viewMode === "compact") {
    return cn(base, "flex items-center gap-3 p-2.5")
  }

  if (viewMode === "grid") {
    return cn(base, "flex h-full flex-col gap-3 p-3")
  }

  return cn(base, "flex items-start gap-3 p-3")
}

function viewButtonCls(active: boolean) {
  return cn(
    "flex h-9 items-center gap-1.5 rounded-full border border-panel-border px-3 font-mono text-xs lowercase transition-colors",
    active
      ? "bg-control-active text-control-active-foreground"
      : "bg-control text-text-secondary hover:bg-panel-hover hover:text-foreground",
  )
}