"use client"

import { GitBranch, GitCommitHorizontal, GitMerge, Radio, RefreshCw } from "lucide-react"
import * as React from "react"
import { MotionNumber } from "../motion-number"
import { Explain, SectionHeading } from "../primitives"

type ChangelogCommit = {
  id: string
  kind: "commit"
  sha: string
  shortSha: string
  title: string
  body: string
  date: string
  url: string | null
  author: string
  authorLogin: string | null
  avatarUrl: string | null
  branches: string[]
  parentCount: number
}

type ChangelogEvent = {
  id: string
  kind: "event"
  eventType: string
  title: string
  description: string
  date: string
  actor: string
  avatarUrl: string | null
  branch: string | null
  url: string | null
}

type ChangelogItem = ChangelogCommit | ChangelogEvent

type ChangelogData = {
  repo: string
  generatedAt: string
  source: string
  branches: { name: string; sha: string | null }[]
  commits: ChangelogCommit[]
  events: ChangelogEvent[]
  items: ChangelogItem[]
  error?: string
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value))
  } catch {
    return value
  }
}

function dayKey(value: string) {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(value))
  } catch {
    return "без даты"
  }
}

function isCommit(item: ChangelogItem): item is ChangelogCommit {
  return item.kind === "commit"
}

export function TimelineSection() {
  const [data, setData] = React.useState<ChangelogData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [filter, setFilter] = React.useState<"all" | "commits" | "events">("all")

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/changelog", { cache: "no-store" })
      setData((await res.json()) as ChangelogData)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void load()
  }, [load])

  const items = React.useMemo(() => {
    const all = data?.items ?? []
    if (filter === "commits") return all.filter(isCommit)
    if (filter === "events") return all.filter((item) => !isCommit(item))
    return all
  }, [data?.items, filter])

  const grouped = React.useMemo(() => {
    return items.reduce<Record<string, ChangelogItem[]>>((acc, item) => {
      ;(acc[dayKey(item.date)] ??= []).push(item)
      return acc
    }, {})
  }, [items])

  const days = Object.keys(grouped)

  return (
    <div className="flex min-w-0 flex-col gap-8">
      <header className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <SectionHeading title="changelog проекта" link />
            <Explain>
              живой журнал изменений из GitHub: коммиты, события репозитория и ветки. данные подтягиваются с сервера и группируются по датам.
            </Explain>
          </div>
          <button
            onClick={() => void load()}
            className="inline-flex w-fit items-center gap-2 rounded-2xl border border-panel-border bg-control px-4 py-2.5 font-mono text-[12px] lowercase text-text-secondary transition-colors hover:bg-panel-hover hover:text-foreground"
          >
            <RefreshCw className="size-3.5" /> обновить
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="коммитов" value={data?.commits.length ?? 0} icon={<GitCommitHorizontal className="size-4" />} />
          <StatCard label="событий" value={data?.events.length ?? 0} icon={<Radio className="size-4" />} />
          <StatCard label="веток" value={data?.branches.length ?? 0} icon={<GitBranch className="size-4" />} />
          <StatCard label="источник" valueText={data?.source ?? "github"} icon={<GitMerge className="size-4" />} />
        </div>

        <div className="flex min-w-0 flex-col gap-3 rounded-3xl border border-panel-border bg-panel-soft p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>всё</FilterButton>
            <FilterButton active={filter === "commits"} onClick={() => setFilter("commits")}>коммиты</FilterButton>
            <FilterButton active={filter === "events"} onClick={() => setFilter("events")}>события</FilterButton>
          </div>
          <div className="min-w-0 truncate font-mono text-[11px] lowercase text-text-faint">
            {data?.repo ?? "program-perfect/mixture"} · {data ? formatDate(data.generatedAt) : "загрузка"}
          </div>
        </div>
      </header>

      {data?.error ? (
        <div className="rounded-3xl border border-panel-border bg-control p-5 font-mono text-[13px] lowercase text-text-secondary">
          GitHub API сейчас не отдал changelog: {data.error}
        </div>
      ) : null}

      {loading && !data ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-20 rounded-3xl border border-panel-border bg-panel-soft/70" />
          ))}
        </div>
      ) : (
        <div className="flex min-w-0 flex-col gap-8">
          {days.map((day) => (
            <section key={day} className="grid min-w-0 gap-3 lg:grid-cols-[180px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)]">
              <div className="sticky top-4 h-fit rounded-2xl border border-panel-border bg-control px-4 py-3 font-mono text-[12px] lowercase text-text-secondary lg:text-right">
                {day}
              </div>
              <div className="relative min-w-0 border-l border-panel-border/70 pl-4 sm:pl-6">
                <div className="flex min-w-0 flex-col gap-3">
                  {grouped[day].map((item) => (
                    <ChangelogRow key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, valueText, icon }: { label: string; value?: number; valueText?: string; icon: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-3xl border border-panel-border bg-panel-soft p-4">
      <div className="mb-4 flex items-center justify-between text-text-muted">
        <span className="font-mono text-[11px] lowercase">{label}</span>
        {icon}
      </div>
      <div className="truncate font-mono text-2xl font-bold lowercase text-foreground">
        {valueText ?? <MotionNumber value={value ?? 0} />}
      </div>
    </div>
  )
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? "rounded-2xl bg-control-active px-3 py-2 font-mono text-[12px] lowercase text-control-active-foreground"
          : "rounded-2xl bg-control px-3 py-2 font-mono text-[12px] lowercase text-text-secondary transition-colors hover:bg-panel-hover hover:text-foreground"
      }
    >
      {children}
    </button>
  )
}

function ChangelogRow({ item }: { item: ChangelogItem }) {
  const commit = isCommit(item)
  const Icon = commit ? (item.parentCount > 1 ? GitMerge : GitCommitHorizontal) : Radio
  const href = commit ? item.url : item.url

  const card = (
    <article className="group relative min-w-0 rounded-3xl border border-panel-border bg-panel-soft p-4 transition-colors hover:bg-panel-hover sm:p-5">
      <span className="absolute -left-[25px] top-7 size-3 rounded-full border border-panel-border bg-control-active sm:-left-[31px]" />
      <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-panel-border bg-control px-2.5 py-1 font-mono text-[11px] lowercase text-text-muted">
              <Icon className="size-3.5" /> {commit ? item.shortSha : item.eventType.replace(/Event$/, "")}
            </span>
            <span className="font-mono text-[11px] lowercase text-text-faint">{formatDate(item.date)}</span>
          </div>
          <h3 className="min-w-0 break-words font-mono text-[15px] font-bold lowercase leading-snug text-foreground sm:text-base">
            {item.title}
          </h3>
          <p className="mt-2 line-clamp-3 break-words font-mono text-[12px] leading-relaxed text-text-secondary sm:text-[13px]">
            {commit ? item.body || `автор: ${item.author}` : item.description}
          </p>
        </div>

        <div className="flex min-w-0 shrink-0 flex-wrap items-center gap-2 xl:max-w-[42%] xl:justify-end">
          {(commit ? item.branches : item.branch ? [item.branch] : []).slice(0, 5).map((branch) => (
            <span key={branch} className="max-w-full truncate rounded-xl border border-panel-border bg-control px-2.5 py-1 font-mono text-[11px] lowercase text-text-secondary">
              {branch}
            </span>
          ))}
          <span className="max-w-full truncate rounded-xl bg-control px-2.5 py-1 font-mono text-[11px] lowercase text-text-faint">
            {commit ? item.author : item.actor}
          </span>
        </div>
      </div>
    </article>
  )

  if (!href) return card

  return (
    <a href={href} target="_blank" rel="noreferrer" className="block min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {card}
    </a>
  )
}
