"use client"

import {
  Activity,
  ArrowDownAZ,
  BarChart3,
  Code2,
  Copy,
  ExternalLink,
  Filter,
  GitBranch,
  GitCommitHorizontal,
  GitMerge,
  GitPullRequest,
  Radio,
  RefreshCw,
  Search,
  Star,
  Tags,
  Users,
} from "lucide-react"
import * as React from "react"
import { MotionNumber } from "../motion-number"
import { Explain } from "../primitives"
import { useScreenkit } from "../store"

type ChangelogCommit = {
  id: string
  slug: string
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
  slug: string
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

type ContributorStats = {
  login: string
  avatarUrl: string | null
  url: string | null
  contributions: number
  commits: number
  events: number
  lastActiveAt: string | null
  score: number
}

type BranchStats = {
  name: string
  sha: string | null
  protected: boolean
  commits: number
  lastCommitAt: string | null
}

type LanguageStat = { name: string; bytes: number; percent: number }
type DayStat = { day: string; commits: number; events: number; total: number }

type RepoSmallItem = {
  id: number
  number: number | null
  title: string
  state: string
  url: string | null
  updatedAt: string | null
  author: string
  avatarUrl: string | null
}

type ChangelogData = {
  repo: string
  generatedAt: string
  source: string
  repository: {
    name: string
    url: string | null
    description: string | null
    defaultBranch: string
    primaryLanguage: string | null
    stars: number
    watchers: number
    forks: number
    openIssues: number
    size: number
    createdAt: string | null
    updatedAt: string | null
    pushedAt: string | null
    license: string | null
  } | null
  branches: BranchStats[]
  contributors: ContributorStats[]
  languages: LanguageStat[]
  releases: {
    id: number
    name: string
    tag: string | null
    url: string | null
    publishedAt: string | null
  }[]
  tags: { name: string; sha: string | null }[]
  issues: { open: number; closed: number; recent: RepoSmallItem[] }
  pulls: { open: number; closed: number; recent: RepoSmallItem[] }
  stats: {
    days: DayStat[]
    eventTypes: { type: string; count: number }[]
    totals: Record<string, number>
  }
  commits: ChangelogCommit[]
  events: ChangelogEvent[]
  items: ChangelogItem[]
  error?: string
}

type ItemFilter = "all" | "commits" | "events" | "merges"
type SortKey = "newest" | "oldest" | "author" | "branch" | "type" | "title"
type PageSize = 10 | 20 | 40 | 80

const REFRESH_MS = 30_000
const CACHE_KEY = "screenkit-changelog-cache-v2"
const PAGE_SIZES: PageSize[] = [10, 20, 40, 80]

const TEXT = {
  ru: {
    title: "журнал изменений",
    desc: "живой changelog из GitHub: коммиты всех веток, события репозитория, контрибьюторы, языки, релизы, теги, issue и pull request. данные появляются из локального кэша сразу и тихо обновляются в фоне.",
    refresh: "обновить",
    refreshing: "обновляю",
    loading: "загружаю журнал изменений…",
    commits: "коммитов",
    events: "событий",
    branches: "веток",
    contributors: "контрибьюторов",
    live: "реальное время",
    defaultBranch: "основная ветка",
    graphs: "графики репозитория",
    contributorActivity: "активность контрибьюторов",
    search: "поиск по журналу…",
    feed: "лента изменений",
    releasesTags: "релизы и теги",
    issuesPulls: "issue и pull request",
    copied: "скопировано",
    autoRefresh: "автообновление · 30с",
    licenseEmpty: "лицензия —",
    github: "github",
    stars: "звёзды",
    forks: "форки",
    open: "открыто",
    size: "размер",
    pushed: "пуш",
    updated: "обновлено",
    activity: "активность",
    languages: "языки",
    score: "счёт",
    protected: "защищена",
    empty: "пусто",
    prev: "назад",
    next: "вперёд",
    page: "страница",
    of: "из",
    onPage: "на странице",
    githubContrib: "github",
    filterLabels: {
      all: "все",
      commits: "коммиты",
      events: "события",
      merges: "мержи",
    },
    sortLabels: {
      newest: "новые сверху",
      oldest: "старые сверху",
      author: "по автору",
      branch: "по ветке",
      type: "по типу",
      title: "по заголовку",
    },
    itemTypes: {
      commit: "коммит",
      merge: "мерж",
      Push: "пуш",
      Create: "создание",
      Delete: "удаление",
      PullRequest: "pull request",
      Issues: "issue",
      Release: "релиз",
      Watch: "звезда",
      Fork: "форк",
    },
  },
  en: {
    title: "changelog",
    desc: "live GitHub changelog: commits from every branch, repository events, contributors, languages, releases, tags, issues and pull requests. data paints instantly from local cache and refreshes quietly in the background.",
    refresh: "refresh",
    refreshing: "refreshing",
    loading: "loading changelog…",
    commits: "commits",
    events: "events",
    branches: "branches",
    contributors: "contributors",
    live: "real time",
    defaultBranch: "default branch",
    graphs: "repository charts",
    contributorActivity: "contributor activity",
    search: "search changelog…",
    feed: "change feed",
    releasesTags: "releases and tags",
    issuesPulls: "issues and pull requests",
    copied: "copied",
    autoRefresh: "auto refresh · 30s",
    licenseEmpty: "license —",
    github: "github",
    stars: "stars",
    forks: "forks",
    open: "open",
    size: "size",
    pushed: "pushed",
    updated: "updated",
    activity: "activity",
    languages: "languages",
    score: "score",
    protected: "protected",
    empty: "empty",
    prev: "prev",
    next: "next",
    page: "page",
    of: "of",
    onPage: "per page",
    githubContrib: "github",
    filterLabels: {
      all: "all",
      commits: "commits",
      events: "events",
      merges: "merges",
    },
    sortLabels: {
      newest: "newest first",
      oldest: "oldest first",
      author: "by author",
      branch: "by branch",
      type: "by type",
      title: "by title",
    },
    itemTypes: {
      commit: "commit",
      merge: "merge",
      Push: "push",
      Create: "create",
      Delete: "delete",
      PullRequest: "pull request",
      Issues: "issue",
      Release: "release",
      Watch: "star",
      Fork: "fork",
    },
  },
} as const

function isCommit(item: ChangelogItem): item is ChangelogCommit {
  return item.kind === "commit"
}

function timestamp(value: string) {
  const time = new Date(value).getTime()
  return Number.isFinite(time) ? time : 0
}

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return "—"
  try {
    return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "ru-RU", {
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

function rawItemType(item: ChangelogItem) {
  return isCommit(item)
    ? item.parentCount > 1
      ? "merge"
      : "commit"
    : item.eventType.replace(/Event$/, "")
}

function itemActor(item: ChangelogItem) {
  return isCommit(item) ? item.authorLogin ?? item.author : item.actor
}

function itemBranches(item: ChangelogItem) {
  return isCommit(item) ? item.branches : item.branch ? [item.branch] : []
}

function max(values: number[]) {
  return Math.max(1, ...values)
}

function readParam(params: URLSearchParams, key: string, fallback: string) {
  return params.get(key) || fallback
}

function isFilter(value: string): value is ItemFilter {
  return ["all", "commits", "events", "merges"].includes(value)
}

function isSort(value: string): value is SortKey {
  return ["newest", "oldest", "author", "branch", "type", "title"].includes(value)
}

function isPageSize(value: string): value is `${PageSize}` {
  return ["10", "20", "40", "80"].includes(value)
}

function copyPublicAnchor(slug: string) {
  if (typeof window === "undefined") return
  const url = new URL(window.location.href)
  url.hash = slug
  void navigator.clipboard?.writeText(url.toString())
  window.history.replaceState(null, "", url)
}

function readCache(): ChangelogData | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ChangelogData
    return Array.isArray(parsed.items) ? parsed : null
  } catch {
    return null
  }
}

function writeCache(data: ChangelogData) {
  try {
    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    // ignore storage quota / private mode
  }
}

export function TimelineSection() {
  const { locale } = useScreenkit()
  const text = locale === "en" ? TEXT.en : TEXT.ru
  const [data, setData] = React.useState<ChangelogData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<ItemFilter>("all")
  const [sort, setSort] = React.useState<SortKey>("newest")
  const [branch, setBranch] = React.useState("all")
  const [author, setAuthor] = React.useState("all")
  const [pageSize, setPageSize] = React.useState<PageSize>(20)
  const [page, setPage] = React.useState(1)
  const [copied, setCopied] = React.useState<string | null>(null)

  const load = React.useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setRefreshing(true)
    try {
      const res = await fetch("/api/changelog", {
        cache: "default",
        headers: { Accept: "application/json" },
      })
      const next = (await res.json()) as ChangelogData
      setData(next)
      writeCache(next)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const f = readParam(params, "log", "all")
    const s = readParam(params, "sort", "newest")
    const size = readParam(params, "per", "20")
    const p = Number(readParam(params, "page", "1"))

    setQuery(readParam(params, "q", ""))
    setBranch(readParam(params, "branch", "all"))
    setAuthor(readParam(params, "author", "all"))
    if (isFilter(f)) setFilter(f)
    if (isSort(s)) setSort(s)
    if (isPageSize(size)) setPageSize(Number(size) as PageSize)
    if (Number.isFinite(p) && p > 0) setPage(Math.floor(p))
  }, [])

  React.useEffect(() => {
    const cached = readCache()
    if (cached) {
      setData(cached)
      setLoading(false)
      void load(true)
    } else {
      void load(false)
    }

    const id = window.setInterval(() => void load(true), REFRESH_MS)
    return () => window.clearInterval(id)
  }, [load])

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    params.set("view", "changelog")
    if (query) params.set("q", query)
    else params.delete("q")
    params.set("log", filter)
    params.set("sort", sort)
    params.set("page", String(page))
    params.set("per", String(pageSize))
    if (branch !== "all") params.set("branch", branch)
    else params.delete("branch")
    if (author !== "all") params.set("author", author)
    else params.delete("author")
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}${window.location.hash}`)
  }, [query, filter, sort, page, pageSize, branch, author])

  const authors = React.useMemo(() => {
    const values = new Set((data?.items ?? []).map(itemActor).filter(Boolean))
    return ["all", ...Array.from(values).sort((a, b) => a.localeCompare(b))]
  }, [data?.items])

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase()
    return (data?.items ?? [])
      .filter((item) => {
        if (filter === "commits" && !isCommit(item)) return false
        if (filter === "events" && isCommit(item)) return false
        if (filter === "merges" && (!isCommit(item) || item.parentCount <= 1)) return false
        if (branch !== "all" && !itemBranches(item).includes(branch)) return false
        if (author !== "all" && itemActor(item) !== author) return false
        if (!needle) return true
        return [
          item.title,
          isCommit(item) ? item.body : item.description,
          rawItemType(item),
          itemActor(item),
          ...itemBranches(item),
        ]
          .join(" ")
          .toLowerCase()
          .includes(needle)
      })
      .sort((a, b) => {
        if (sort === "oldest") return timestamp(a.date) - timestamp(b.date)
        if (sort === "author") return itemActor(a).localeCompare(itemActor(b))
        if (sort === "branch") return (itemBranches(a)[0] ?? "").localeCompare(itemBranches(b)[0] ?? "")
        if (sort === "type") return rawItemType(a).localeCompare(rawItemType(b))
        if (sort === "title") return a.title.localeCompare(b.title)
        return timestamp(b.date) - timestamp(a.date)
      })
  }, [data?.items, query, filter, sort, branch, author])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const copy = (slug: string) => {
    copyPublicAnchor(slug)
    setCopied(slug)
    window.setTimeout(() => setCopied(null), 1200)
  }

  return (
    <div className="sk-page-enter flex min-w-0 flex-col gap-8">
      <header id="repo" className="sk-fly-from-top flex min-w-0 flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <CopyableTitle
              id="repo"
              title={text.title}
              onCopy={copy}
              copied={copied === "repo"}
              copiedText={text.copied}
            />
            <Explain>{text.desc}</Explain>
          </div>
          <button
            onClick={() => void load(false)}
            className="inline-flex w-fit items-center gap-2 rounded-2xl border border-panel-border bg-control px-4 py-2.5 font-mono text-[12px] lowercase text-text-secondary transition-colors hover:bg-panel-hover hover:text-foreground"
          >
            <RefreshCw className={refreshing ? "size-3.5 animate-spin" : "size-3.5"} />
            {refreshing ? text.refreshing : text.refresh}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label={text.commits} value={data?.commits.length ?? 0} icon={<GitCommitHorizontal className="size-4" />} />
          <StatCard label={text.events} value={data?.events.length ?? 0} icon={<Radio className="size-4" />} />
          <StatCard label={text.branches} value={data?.branches.length ?? 0} icon={<GitBranch className="size-4" />} />
          <StatCard label={text.contributors} value={data?.contributors.length ?? 0} icon={<Users className="size-4" />} />
        </div>
      </header>

      {loading && !data ? (
        <div className="rounded-3xl border border-panel-border bg-control p-5 font-mono text-[13px] lowercase text-text-secondary">
          {text.loading}
        </div>
      ) : null}

      {data?.error ? (
        <div className="rounded-3xl border border-panel-border bg-control p-5 font-mono text-[13px] lowercase text-text-secondary">
          GitHub API: {data.error}
        </div>
      ) : null}

      <section className="sk-fly-from-left grid min-w-0 gap-3 xl:grid-cols-[1.2fr_0.8fr]">
        <RepoCard data={data} locale={locale} text={text} onCopy={copy} copied={copied} />
        <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <MiniInfo title={text.live} icon={<Activity className="size-4" />} value={data ? formatDate(data.generatedAt, locale) : "—"} note={text.autoRefresh} />
          <MiniInfo title={text.defaultBranch} icon={<GitBranch className="size-4" />} value={data?.repository?.defaultBranch ?? "—"} note={data?.repository?.license ?? text.licenseEmpty} />
        </div>
      </section>

      <section id="graphs" className="sk-fly-from-right flex min-w-0 flex-col gap-3">
        <CopyableTitle id="graphs" title={text.graphs} onCopy={copy} copied={copied === "graphs"} copiedText={text.copied} small />
        <div className="grid min-w-0 gap-3 xl:grid-cols-3">
          <ActivityChart data={data?.stats.days ?? []} text={text} />
          <LanguageChart data={data?.languages ?? []} text={text} />
          <EventChart data={data?.stats.eventTypes ?? []} text={text} />
        </div>
      </section>

      <section id="contributors" className="sk-fly-from-left flex min-w-0 flex-col gap-3">
        <CopyableTitle id="contributors" title={text.contributorActivity} onCopy={copy} copied={copied === "contributors"} copiedText={text.copied} small />
        <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(data?.contributors ?? []).slice(0, 6).map((contributor, index) => (
            <ContributorCard
              key={contributor.login}
              contributor={contributor}
              maxScore={max((data?.contributors ?? []).map((c) => c.score))}
              index={index}
              text={text}
            />
          ))}
        </div>
      </section>

      <section id="filters" className="sk-fly-from-bottom rounded-3xl border border-panel-border bg-panel-soft p-3">
        <div className="grid min-w-0 gap-3 xl:grid-cols-[1.2fr_repeat(5,minmax(0,0.7fr))]">
          <label className="relative min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-faint" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(1)
              }}
              placeholder={text.search}
              className="h-11 w-full rounded-2xl border border-panel-border bg-control pl-10 pr-3 font-mono text-[12px] lowercase outline-none transition-colors placeholder:text-text-faint focus:border-ring"
            />
          </label>
          <SelectControl
            icon={<Filter className="size-3.5" />}
            value={filter}
            onChange={(value) => {
              setFilter(value as ItemFilter)
              setPage(1)
            }}
            options={["all", "commits", "events", "merges"]}
            getLabel={(value) => text.filterLabels[value as ItemFilter]}
          />
          <SelectControl
            icon={<ArrowDownAZ className="size-3.5" />}
            value={sort}
            onChange={(value) => setSort(value as SortKey)}
            options={["newest", "oldest", "author", "branch", "type", "title"]}
            getLabel={(value) => text.sortLabels[value as SortKey]}
          />
          <SelectControl
            icon={<GitBranch className="size-3.5" />}
            value={branch}
            onChange={(value) => {
              setBranch(value)
              setPage(1)
            }}
            options={["all", ...(data?.branches ?? []).map((item) => item.name)]}
            getLabel={(value) => (value === "all" ? text.filterLabels.all : value)}
          />
          <SelectControl
            icon={<Users className="size-3.5" />}
            value={author}
            onChange={(value) => {
              setAuthor(value)
              setPage(1)
            }}
            options={authors}
            getLabel={(value) => (value === "all" ? text.filterLabels.all : value)}
          />
          <SelectControl
            value={String(pageSize)}
            onChange={(value) => {
              setPageSize(Number(value) as PageSize)
              setPage(1)
            }}
            options={PAGE_SIZES.map(String)}
            getLabel={(value) => `${text.onPage}: ${value}`}
          />
        </div>
      </section>

      <section id="feed" className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CopyableTitle id="feed" title={text.feed} onCopy={copy} copied={copied === "feed"} copiedText={text.copied} small />
          <span className="font-mono text-[11px] lowercase text-text-faint">
            {text.page} <MotionNumber value={safePage} /> {text.of} <MotionNumber value={totalPages} />
          </span>
        </div>
        {paginated.map((item, index) => (
          <ChangelogRow
            key={item.id}
            item={item}
            index={index}
            onCopy={copy}
            copied={copied === item.slug}
            copiedText={text.copied}
            locale={locale}
            text={text}
          />
        ))}
        <Pagination page={safePage} totalPages={totalPages} setPage={setPage} text={text} />
      </section>

      <section className="grid min-w-0 gap-3 xl:grid-cols-3">
        <BranchList branches={data?.branches ?? []} text={text} />
        <ReleaseTagList releases={data?.releases ?? []} tags={data?.tags ?? []} text={text} locale={locale} />
        <IssuePullList issues={data?.issues} pulls={data?.pulls} text={text} locale={locale} />
      </section>
    </div>
  )
}

function localizedType(value: string, text: (typeof TEXT)["ru"] | (typeof TEXT)["en"]) {
  const clean = value.replace(/Event$/, "") as keyof typeof text.itemTypes
  return text.itemTypes[clean] ?? value.toLowerCase()
}

function CopyableTitle({
  id,
  title,
  onCopy,
  copied,
  copiedText,
  small = false,
}: {
  id: string
  title: string
  onCopy: (id: string) => void
  copied: boolean
  copiedText: string
  small?: boolean
}) {
  return (
    <button id={id} onClick={() => onCopy(id)} className="group flex w-fit max-w-full min-w-0 items-center gap-2 text-left">
      <span className={small ? "font-mono text-lg font-bold lowercase text-foreground" : "font-mono text-3xl font-black lowercase tracking-tight text-foreground sm:text-4xl"}>
        {title}
      </span>
      <Copy className="size-4 shrink-0 text-text-faint opacity-0 transition-opacity group-hover:opacity-100" />
      {copied ? <span className="font-mono text-[11px] lowercase text-text-faint">{copiedText}</span> : null}
    </button>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="sk-animate-in min-w-0 rounded-3xl border border-panel-border bg-panel-soft p-4">
      <div className="mb-4 flex items-center justify-between text-text-muted">
        <span className="font-mono text-[11px] lowercase">{label}</span>
        {icon}
      </div>
      <div className="truncate font-mono text-2xl font-bold lowercase text-foreground">
        <MotionNumber value={value} />
      </div>
    </div>
  )
}

function RepoCard({
  data,
  locale,
  text,
  onCopy,
  copied,
}: {
  data: ChangelogData | null
  locale: string
  text: (typeof TEXT)["ru"] | (typeof TEXT)["en"]
  onCopy: (id: string) => void
  copied: string | null
}) {
  const repo = data?.repository
  return (
    <article className="min-w-0 rounded-3xl border border-panel-border bg-panel-soft p-5">
      <CopyableTitle
        id="repository"
        title={repo?.name ?? data?.repo ?? "program-perfect/mixture"}
        onCopy={onCopy}
        copied={copied === "repository"}
        copiedText={text.copied}
        small
      />
      <p className="mt-3 max-w-3xl font-mono text-[13px] lowercase leading-relaxed text-text-secondary">
        {repo?.description ?? "live GitHub repository metadata"}
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <RepoMetric icon={<Star className="size-4" />} label={text.stars} value={repo?.stars ?? 0} />
        <RepoMetric icon={<GitBranch className="size-4" />} label={text.forks} value={repo?.forks ?? 0} />
        <RepoMetric icon={<GitPullRequest className="size-4" />} label={text.open} value={repo?.openIssues ?? 0} />
        <RepoMetric icon={<Code2 className="size-4" />} label={text.size} value={`${repo?.size ?? 0}kb`} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2 font-mono text-[11px] lowercase text-text-faint">
        <span className="rounded-xl bg-control px-2.5 py-1">
          {text.pushed} · {formatDate(repo?.pushedAt, locale)}
        </span>
        <span className="rounded-xl bg-control px-2.5 py-1">
          {text.updated} · {formatDate(repo?.updatedAt, locale)}
        </span>
        {repo?.url ? (
          <a href={repo.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-xl bg-control px-2.5 py-1 hover:text-foreground">
            {text.github} <ExternalLink className="size-3" />
          </a>
        ) : null}
      </div>
    </article>
  )
}

function RepoMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-panel-border bg-control p-3">
      <div className="mb-2 flex justify-between text-text-muted">
        <span className="font-mono text-[10px] lowercase">{label}</span>
        {icon}
      </div>
      <div className="font-mono text-lg font-bold text-foreground">
        {typeof value === "number" ? <MotionNumber value={value} /> : value}
      </div>
    </div>
  )
}

function MiniInfo({ title, value, note, icon }: { title: string; value: string; note: string; icon: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-3xl border border-panel-border bg-panel-soft p-5">
      <div className="mb-3 flex items-center gap-2 text-text-muted">
        {icon}
        <span className="font-mono text-[11px] lowercase">{title}</span>
      </div>
      <div className="truncate font-mono text-base font-bold lowercase text-foreground">{value}</div>
      <div className="mt-2 truncate font-mono text-[11px] lowercase text-text-faint">{note}</div>
    </div>
  )
}

function ActivityChart({ data, text }: { data: DayStat[]; text: (typeof TEXT)["ru"] | (typeof TEXT)["en"] }) {
  const rows = data.slice(-24)
  const peak = max(rows.map((day) => day.total))
  return (
    <ChartCard title={text.activity}>
      <div className="flex h-44 items-end gap-1.5">
        {rows.map((day, index) => (
          <div key={day.day} className="sk-chart-bar flex flex-1 flex-col items-center justify-end gap-1" style={{ "--sk-delay": `${index * 18}ms` } as React.CSSProperties}>
            <div className="w-full rounded-t-lg bg-control-active" style={{ height: `${Math.max(6, (day.total / peak) * 100)}%` }} />
            <span className="hidden font-mono text-[9px] text-text-faint sm:block">{day.day.slice(5)}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}

function LanguageChart({ data, text }: { data: LanguageStat[]; text: (typeof TEXT)["ru"] | (typeof TEXT)["en"] }) {
  return (
    <ChartCard title={text.languages}>
      <div className="flex flex-col gap-3">
        {data.slice(0, 7).map((lang, index) => (
          <div key={lang.name} className="sk-animate-in" style={{ "--sk-delay": `${index * 45}ms` } as React.CSSProperties}>
            <div className="mb-1 flex justify-between font-mono text-[11px] lowercase text-text-secondary">
              <span>{lang.name}</span>
              <span>{lang.percent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-control">
              <div className="h-full rounded-full bg-control-active" style={{ width: `${lang.percent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}

function EventChart({ data, text }: { data: { type: string; count: number }[]; text: (typeof TEXT)["ru"] | (typeof TEXT)["en"] }) {
  const peak = max(data.map((item) => item.count))
  return (
    <ChartCard title={text.events}>
      <div className="flex flex-col gap-2">
        {data.slice(0, 8).map((event, index) => (
          <div key={event.type} className="grid grid-cols-[86px_minmax(0,1fr)_32px] items-center gap-2 font-mono text-[11px] lowercase">
            <span className="truncate text-text-secondary">{localizedType(event.type, text)}</span>
            <div className="h-2 overflow-hidden rounded-full bg-control">
              <div className="sk-chart-line h-full rounded-full bg-control-active" style={{ width: `${Math.max(4, (event.count / peak) * 100)}%`, "--sk-delay": `${index * 45}ms` } as React.CSSProperties} />
            </div>
            <span className="text-right text-text-faint">
              <MotionNumber value={event.count} />
            </span>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-3xl border border-panel-border bg-panel-soft p-4">
      <div className="mb-4 flex items-center gap-2 text-text-muted">
        <BarChart3 className="size-4" />
        <span className="font-mono text-[11px] lowercase">{title}</span>
      </div>
      {children}
    </div>
  )
}

function ContributorCard({
  contributor,
  maxScore,
  index,
  text,
}: {
  contributor: ContributorStats
  maxScore: number
  index: number
  text: (typeof TEXT)["ru"] | (typeof TEXT)["en"]
}) {
  return (
    <article className="sk-animate-in min-w-0 rounded-3xl border border-panel-border bg-panel-soft p-4" style={{ "--sk-delay": `${index * 55}ms` } as React.CSSProperties}>
      <div className="flex items-center gap-3">
        <div className="size-11 overflow-hidden rounded-2xl border border-panel-border bg-control">
          {contributor.avatarUrl ? <img src={contributor.avatarUrl} alt="" className="h-full w-full object-cover" /> : null}
        </div>
        <div className="min-w-0">
          <div className="truncate font-mono text-sm font-bold text-foreground">{contributor.login}</div>
          <div className="font-mono text-[11px] lowercase text-text-faint">
            {text.score} · <MotionNumber value={contributor.score} />
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center font-mono text-[11px] lowercase">
        <span className="rounded-xl bg-control p-2"><MotionNumber value={contributor.commits} /><br />{text.commits}</span>
        <span className="rounded-xl bg-control p-2"><MotionNumber value={contributor.events} /><br />{text.events}</span>
        <span className="rounded-xl bg-control p-2"><MotionNumber value={contributor.contributions} /><br />{text.githubContrib}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-control">
        <div className="h-full rounded-full bg-control-active" style={{ width: `${Math.max(4, (contributor.score / maxScore) * 100)}%` }} />
      </div>
    </article>
  )
}

function SelectControl({
  value,
  onChange,
  options,
  icon,
  getLabel,
}: {
  value: string
  onChange: (value: string) => void
  options: string[]
  icon?: React.ReactNode
  getLabel?: (value: string) => string
}) {
  return (
    <label className="relative min-w-0">
      {icon ? <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-faint">{icon}</span> : null}
      <select value={value} onChange={(event) => onChange(event.target.value)} className={`h-11 w-full rounded-2xl border border-panel-border bg-control ${icon ? "pl-9" : "pl-3"} pr-8 font-mono text-[12px] lowercase outline-none focus:border-ring`}>
        {options.map((option) => (
          <option key={option} value={option}>
            {getLabel ? getLabel(option) : option}
          </option>
        ))}
      </select>
    </label>
  )
}

function ChangelogRow({
  item,
  index,
  onCopy,
  copied,
  copiedText,
  locale,
  text,
}: {
  item: ChangelogItem
  index: number
  onCopy: (slug: string) => void
  copied: boolean
  copiedText: string
  locale: string
  text: (typeof TEXT)["ru"] | (typeof TEXT)["en"]
}) {
  const commit = isCommit(item)
  const Icon = commit ? (item.parentCount > 1 ? GitMerge : GitCommitHorizontal) : Radio
  const href = item.url
  const type = rawItemType(item)
  return (
    <article id={item.slug} className="sk-animate-in group relative min-w-0 rounded-3xl border border-panel-border bg-panel-soft p-4 transition-colors hover:bg-panel-hover sm:p-5" style={{ "--sk-delay": `${Math.min(index * 35, 320)}ms` } as React.CSSProperties}>
      <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-panel-border bg-control px-2.5 py-1 font-mono text-[11px] lowercase text-text-muted">
              <Icon className="size-3.5" /> {commit ? item.shortSha : localizedType(type, text)}
            </span>
            <span className="font-mono text-[11px] lowercase text-text-faint">{formatDate(item.date, locale)}</span>
          </div>
          <button onClick={() => onCopy(item.slug)} className="flex max-w-full items-center gap-2 text-left">
            <h3 className="min-w-0 break-words font-mono text-[15px] font-bold lowercase leading-snug text-foreground sm:text-base">{item.title}</h3>
            <Copy className="size-3.5 shrink-0 text-text-faint opacity-0 transition-opacity group-hover:opacity-100" />
            {copied ? <span className="font-mono text-[10px] text-text-faint">{copiedText}</span> : null}
          </button>
          <p className="mt-2 line-clamp-3 break-words font-mono text-[12px] leading-relaxed text-text-secondary sm:text-[13px]">
            {commit ? item.body || `author: ${item.author}` : item.description}
          </p>
        </div>
        <div className="flex min-w-0 shrink-0 flex-wrap items-center gap-2 xl:max-w-[42%] xl:justify-end">
          {itemBranches(item).slice(0, 5).map((name) => (
            <span key={name} className="max-w-full truncate rounded-xl border border-panel-border bg-control px-2.5 py-1 font-mono text-[11px] lowercase text-text-secondary">{name}</span>
          ))}
          <span className="max-w-full truncate rounded-xl bg-control px-2.5 py-1 font-mono text-[11px] lowercase text-text-faint">{itemActor(item)}</span>
          {href ? (
            <a href={href} target="_blank" rel="noreferrer" className="rounded-xl bg-control px-2.5 py-1 text-text-faint hover:text-foreground">
              <ExternalLink className="size-3.5" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function Pagination({ page, totalPages, setPage, text }: { page: number; totalPages: number; setPage: (page: number) => void; text: (typeof TEXT)["ru"] | (typeof TEXT)["en"] }) {
  const start = Math.max(1, Math.min(totalPages - 6, page - 3))
  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, index) => start + index)
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-xl bg-control px-3 py-2 font-mono text-[12px] lowercase disabled:opacity-35">
        {text.prev}
      </button>
      {pages.map((item) => (
        <button key={item} onClick={() => setPage(item)} className={item === page ? "rounded-xl bg-control-active px-3 py-2 font-mono text-[12px] lowercase text-control-active-foreground" : "rounded-xl bg-control px-3 py-2 font-mono text-[12px] lowercase text-text-secondary"}>
          {item}
        </button>
      ))}
      <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded-xl bg-control px-3 py-2 font-mono text-[12px] lowercase disabled:opacity-35">
        {text.next}
      </button>
    </div>
  )
}

function BranchList({ branches, text }: { branches: BranchStats[]; text: (typeof TEXT)["ru"] | (typeof TEXT)["en"] }) {
  const peak = max(branches.map((branch) => branch.commits))
  return (
    <SmallList
      title={text.branches}
      icon={<GitBranch className="size-4" />}
      emptyText={text.empty}
      rows={branches.slice(0, 14).map((branch) => ({
        title: branch.name,
        meta: `${branch.commits} ${text.commits}${branch.protected ? ` · ${text.protected}` : ""}`,
        width: `${Math.max(4, (branch.commits / peak) * 100)}%`,
      }))}
    />
  )
}

function ReleaseTagList({ releases, tags, text, locale }: { releases: ChangelogData["releases"]; tags: ChangelogData["tags"]; text: (typeof TEXT)["ru"] | (typeof TEXT)["en"]; locale: string }) {
  return (
    <SmallList
      title={text.releasesTags}
      icon={<Tags className="size-4" />}
      emptyText={text.empty}
      rows={[
        ...releases.slice(0, 6).map((release) => ({
          title: release.name,
          meta: `${release.tag ?? "release"} · ${formatDate(release.publishedAt, locale)}`,
          url: release.url,
        })),
        ...tags.slice(0, 8).map((tag) => ({
          title: tag.name,
          meta: tag.sha ? tag.sha.slice(0, 7) : "tag",
        })),
      ]}
    />
  )
}

function IssuePullList({ issues, pulls, text, locale }: { issues?: ChangelogData["issues"]; pulls?: ChangelogData["pulls"]; text: (typeof TEXT)["ru"] | (typeof TEXT)["en"]; locale: string }) {
  const rows = [
    ...(issues?.recent ?? []).slice(0, 6).map((issue) => ({
      title: `#${issue.number ?? "—"} · ${issue.title}`,
      meta: `issue · ${issue.state} · ${formatDate(issue.updatedAt, locale)}`,
      url: issue.url,
    })),
    ...(pulls?.recent ?? []).slice(0, 6).map((pull) => ({
      title: `#${pull.number ?? "—"} · ${pull.title}`,
      meta: `pr · ${pull.state} · ${formatDate(pull.updatedAt, locale)}`,
      url: pull.url,
    })),
  ]
  return <SmallList title={text.issuesPulls} icon={<GitPullRequest className="size-4" />} emptyText={text.empty} rows={rows} />
}

function SmallList({
  title,
  icon,
  rows,
  emptyText,
}: {
  title: string
  icon: React.ReactNode
  rows: { title: string; meta: string; url?: string | null; width?: string }[]
  emptyText: string
}) {
  return (
    <div className="min-w-0 rounded-3xl border border-panel-border bg-panel-soft p-4">
      <div className="mb-4 flex items-center gap-2 text-text-muted">
        {icon}
        <span className="font-mono text-[11px] lowercase">{title}</span>
      </div>
      <div className="flex flex-col gap-2">
        {rows.length ? (
          rows.map((row) => {
            const body = (
              <>
                <div className="truncate font-mono text-[12px] font-bold lowercase text-foreground">{row.title}</div>
                <div className="truncate font-mono text-[11px] lowercase text-text-faint">{row.meta}</div>
                {row.width ? (
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-control">
                    <div className="h-full rounded-full bg-control-active" style={{ width: row.width }} />
                  </div>
                ) : null}
              </>
            )
            return row.url ? (
              <a key={`${row.title}-${row.meta}`} href={row.url} target="_blank" rel="noreferrer" className="rounded-2xl bg-control p-3 hover:bg-panel-hover">
                {body}
              </a>
            ) : (
              <div key={`${row.title}-${row.meta}`} className="rounded-2xl bg-control p-3">
                {body}
              </div>
            )
          })
        ) : (
          <div className="rounded-2xl bg-control p-3 font-mono text-[12px] lowercase text-text-faint">{emptyText}</div>
        )}
      </div>
    </div>
  )
}
