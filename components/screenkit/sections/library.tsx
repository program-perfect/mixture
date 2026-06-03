"use client"

import * as React from "react"
import { Search, ArrowUpRight, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  CATEGORIES,
  DEVICES,
  STATUSES,
  INSERTS,
  categoryMeta,
  resolveInsert,
} from "@/lib/screenkit/data"
import {
  categoryLabel,
  deviceLabel,
  statusLabel,
} from "@/lib/screenkit/i18n"
import { categoryIcon } from "../icons"
import {
  IconTile,
  StatusBadge,
  RuOnlyBadge,
  Pill,
  SectionHeading,
  Explain,
} from "../primitives"
import { useScreenkit } from "../store"

export function LibrarySection() {
  const { filters, setFilters, openInPreview, locale, t } = useScreenkit()

  const filtered = INSERTS.filter((i) => {
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
  })

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-col gap-2">
        <SectionHeading title={t("library.title")} />
        <Explain>{t("library.desc")}</Explain>
      </header>

      {/* search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-faint" />
        <Input
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          placeholder={t("library.search")}
          className="h-11 rounded-2xl border-panel-border bg-control pl-9 font-mono text-sm text-foreground placeholder:text-text-faint focus-visible:ring-ring"
        />
      </div>

      {/* filters */}
      <div className="flex flex-col gap-3">
        <FilterRow label={t("library.category")}>
          <Pill active={filters.category === "all"} onClick={() => setFilters((f) => ({ ...f, category: "all" }))}>
            {t("library.all")}
          </Pill>
          {CATEGORIES.map((c) => (
            <Pill
              key={c.id}
              accent={c.accent}
              active={filters.category === c.id}
              onClick={() => setFilters((f) => ({ ...f, category: c.id }))}
            >
              {categoryLabel(c.id, locale)}
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

      {/* count */}
      <div className="flex items-center justify-between border-b border-panel-border pb-2">
        <span className="font-mono text-xs lowercase text-text-muted">
          {filtered.length}{" "}
          {filtered.length === 1 ? t("library.countOne") : t("library.countMany")}
        </span>
        <span className="font-mono text-xs text-text-faint">
          {t("library.dateEpisodeScene")}
        </span>
      </div>

      {/* list */}
      <ul className="flex flex-col gap-2">
        {filtered.map((raw) => {
          const insert = resolveInsert(raw, locale)
          const cat = categoryMeta(insert.category)
          const Icon = categoryIcon[insert.category]
          return (
            <li key={insert.id}>
              <button
                onClick={() => openInPreview(insert.id)}
                className="group flex w-full items-start gap-3 rounded-2xl border border-panel-border bg-panel-soft p-3 text-left transition-colors hover:border-ring hover:bg-panel-hover"
              >
                <IconTile icon={Icon} accent={cat.accent} tint={cat.tint} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-mono text-sm lowercase text-foreground">
                      {insert.title}
                    </span>
                    <StatusBadge
                      status={insert.status}
                      label={statusLabel(insert.status, locale)}
                    />
                    {!insert.hasEnglish && (
                      <RuOnlyBadge
                        label={t("common.ruOnly")}
                        title={t("common.ruOnlyHint")}
                      />
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 font-mono text-[12px] leading-relaxed text-text-muted">
                    {insert.description}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-text-faint">
                    <span>{insert.date}</span>
                    <span>· {insert.episode}</span>
                    <span>· {insert.scene}</span>
                    <span>· {deviceLabel(insert.device, locale)}</span>
                    <span>· {categoryLabel(insert.category, locale)}</span>
                    <span>· {insert.aspect}</span>
                  </div>
                </div>
                <span className="hidden shrink-0 items-center gap-1 self-center rounded-full bg-control px-3 py-1.5 font-mono text-[11px] lowercase text-text-secondary group-hover:bg-control-active group-hover:text-control-active-foreground sm:flex">
                  <Eye className="size-3.5" /> {t("library.preview")}
                  <ArrowUpRight className="size-3" />
                </span>
              </button>
            </li>
          )
        })}
        {filtered.length === 0 && (
          <li className="rounded-2xl border border-dashed border-panel-border p-8 text-center font-mono text-sm text-text-muted">
            {t("library.empty")}
          </li>
        )}
      </ul>
    </div>
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
