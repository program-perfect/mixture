"use client";

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
  id: string;
  slug: string;
  kind: "commit";
  sha: string;
  shortSha: string;
  title: string;
  body: string;
  date: string;
  url: string | null;
  author: string;
  authorLogin: string | null;
  avatarUrl: string | null;
  branches: string[];
  parentCount: number;
};
type ChangelogEvent = {
  id: string;
  slug: string;
  kind: "event";
  eventType: string;
  title: string;
  description: string;
  date: string;
  actor: string;
  avatarUrl: string | null;
  branch: string | null;
  url: string | null;
};
type ChangelogItem = ChangelogCommit | ChangelogEvent;
type ContributorStats = {
  login: string;
  avatarUrl: string | null;
  url: string | null;
  contributions: number;
  commits: number;
  events: number;
  lastActiveAt: string | null;
  score: number;
};
type BranchStats = {
  name: string;
  sha: string | null;
  protected: boolean;
  commits: number;
  lastCommitAt: string | null;
};
type LanguageStat = { name: string; bytes: number; percent: number };
type DayStat = { day: string; commits: number; events: number; total: number };
type RepoSmallItem = {
  id: number;
  number: number | null;
  title: string;
  state: string;
  url: string | null;
  updatedAt: string | null;
  author: string;
  avatarUrl: string | null;
};
type ChangelogData = {
  repo: string;
  generatedAt: string;
  source: string;
  repository: {
    name: string;
    url: string | null;
    description: string | null;
    defaultBranch: string;
    primaryLanguage: string | null;
    stars: number;
    watchers: number;
    forks: number;
    openIssues: number;
    size: number;
    createdAt: string | null;
    updatedAt: string | null;
    pushedAt: string | null;
    license: string | null;
  } | null;
  branches: BranchStats[];
  contributors: ContributorStats[];
  languages: LanguageStat[];
  releases: { id: number; name: string; tag: string | null; url: string | null; publishedAt: string | null }[];
  tags: { name: string; sha: string | null }[];
  issues: { open: number; closed: number; recent: RepoSmallItem[] };
  pulls: { open: number; closed: number; recent: RepoSmallItem[] };
  stats: { days: DayStat[]; eventTypes: { type: string; count: number }[]; totals: Record<string, number> };
  commits: ChangelogCommit[];
  events: ChangelogEvent[];
  items: ChangelogItem[];
  error?: string;
};
type ItemFilter = "all" | "commits" | "events" | "merges";
type SortKey = "newest" | "oldest" | "author" | "branch" | "type" | "title";
type PageSize = 10 | 20 | 40 | 80;

const REFRESH_MS = 15_000;
const PAGE_SIZES: PageSize[] = [10, 20, 40, 80];
const TEXT = {
  ru: {
    title: "журнал изменений",
    desc: "живой changelog из GitHub: коммиты всех веток, события репозитория, контрибьюторы, языки, релизы, теги, issue и pull request. данные обновляются автоматически.",
    refresh: "обновить",
    refreshing: "обновляю",
    commits: "коммитов",
    events: "событий",
    branches: "веток",
    contributors: "контрибьюторов",
    live: "реальное время",
    defaultBranch: "основная ветка",
    graphs: "графики репозитория",
    contributorActivity: "активность контрибьюторов",
    search: "поиск по changelog…",
    feed: "лента изменений",
    releasesTags: "релизы и теги",
    copied: "скопировано",
  },
  en: {
    title: "changelog",
    desc: "live GitHub changelog: commits from every branch, repository events, contributors, languages, releases, tags, issues and pull requests. data refreshes automatically.",
    refresh: "refresh",
    refreshing: "refreshing",
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
    copied: "copied",
  },
} as const;

function isCommit(item: ChangelogItem): item is ChangelogCommit {
  return item.kind === "commit";
}
function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}
function itemType(item: ChangelogItem) {
  return isCommit(item) ? (item.parentCount > 1 ? "merge" : "commit") : item.eventType.replace(/Event$/, "");
}
function itemActor(item: ChangelogItem) {
  return isCommit(item) ? (item.authorLogin ?? item.author) : item.actor;
}
function itemBranches(item: ChangelogItem) {
  return isCommit(item) ? item.branches : item.branch ? [item.branch] : [];
}
function max(values: number[]) {
  return Math.max(1, ...values);
}
function readParam(params: URLSearchParams, key: string, fallback: string) {
  return params.get(key) || fallback;
}
function isFilter(value: string): value is ItemFilter {
  return ["all", "commits", "events", "merges"].includes(value);
}
function isSort(value: string): value is SortKey {
  return ["newest", "oldest", "author", "branch", "type", "title"].includes(value);
}
function isPageSize(value: string): value is `${PageSize}` {
  return ["10", "20", "40", "80"].includes(value);
}
function copyPublicAnchor(slug: string) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.hash = slug;
  void navigator.clipboard?.writeText(url.toString());
  window.history.replaceState(null, "", url);
}

export function TimelineSection() {
  const { locale } = useScreenkit();
  const text = locale === "en" ? TEXT.en : TEXT.ru;
  const [data, setData] = React.useState<ChangelogData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<ItemFilter>("all");
  const [sort, setSort] = React.useState<SortKey>("newest");
  const [branch, setBranch] = React.useState("all");
  const [author, setAuthor] = React.useState("all");
  const [pageSize, setPageSize] = React.useState<PageSize>(20);
  const [page, setPage] = React.useState(1);
  const [copied, setCopied] = React.useState<string | null>(null);
  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/changelog?ts=${Date.now()}`, { cache: "no-store" });
      setData((await res.json()) as ChangelogData);
    } finally {
      setLoading(false);
    }
  }, []);
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const f = readParam(params, "log", "all");
    const s = readParam(params, "sort", "newest");
    const size = readParam(params, "per", "20");
    const p = Number(readParam(params, "page", "1"));
    setQuery(readParam(params, "q", ""));
    setBranch(readParam(params, "branch", "all"));
    setAuthor(readParam(params, "author", "all"));
    if (isFilter(f)) setFilter(f);
    if (isSort(s)) setSort(s);
    if (isPageSize(size)) setPageSize(Number(size) as PageSize);
    if (Number.isFinite(p) && p > 0) setPage(Math.floor(p));
  }, []);
  React.useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), REFRESH_MS);
    return () => window.clearInterval(id);
  }, [load]);
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("view", "changelog");
    if (query) params.set("q", query);
    else params.delete("q");
    params.set("log", filter);
    params.set("sort", sort);
    params.set("page", String(page));
    params.set("per", String(pageSize));
    if (branch !== "all") params.set("branch", branch);
    else params.delete("branch");
    if (author !== "all") params.set("author", author);
    else params.delete("author");
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}${window.location.hash}`);
  }, [query, filter, sort, page, pageSize, branch, author]);
  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (data?.items ?? [])
      .filter((item) => {
        if (filter === "commits" && !isCommit(item)) return false;
        if (filter === "events" && isCommit(item)) return false;
        if (filter === "merges" && (!isCommit(item) || item.parentCount <= 1)) return false;
        if (branch !== "all" && !itemBranches(item).includes(branch)) return false;
        if (author !== "all" && itemActor(item) !== author) return false;
        if (!needle) return true;
        return [
          item.title,
          isCommit(item) ? item.body : item.description,
          itemType(item),
          itemActor(item),
          ...itemBranches(item),
        ]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      })
      .sort((a, b) => {
        if (sort === "oldest") return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sort === "author") return itemActor(a).localeCompare(itemActor(b));
        if (sort === "branch") return (itemBranches(a)[0] ?? "").localeCompare(itemBranches(b)[0] ?? "");
        if (sort === "type") return itemType(a).localeCompare(itemType(b));
        if (sort === "title") return a.title.localeCompare(b.title);
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [data?.items, query, filter, sort, branch, author]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const copy = (slug: string) => {
    copyPublicAnchor(slug);
    setCopied(slug);
    window.setTimeout(() => setCopied(null), 1200);
  };
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
            onClick={() => void load()}
            className="inline-flex w-fit items-center gap-2 rounded-2xl border border-panel-border bg-control px-4 py-2.5 font-mono text-[12px] lowercase text-text-secondary transition-colors hover:bg-panel-hover hover:text-foreground"
          >
            <RefreshCw className="size-3.5" /> {loading ? text.refreshing : text.refresh}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label={text.commits}
            value={data?.commits.length ?? 0}
            icon={<GitCommitHorizontal className="size-4" />}
          />
          <StatCard label={text.events} value={data?.events.length ?? 0} icon={<Radio className="size-4" />} />
          <StatCard label={text.branches} value={data?.branches.length ?? 0} icon={<GitBranch className="size-4" />} />
          <StatCard
            label={text.contributors}
            value={data?.contributors.length ?? 0}
            icon={<Users className="size-4" />}
          />
        </div>
      </header>
      {data?.error ? (
        <div className="rounded-3xl border border-panel-border bg-control p-5 font-mono text-[13px] lowercase text-text-secondary">
          GitHub API: {data.error}
        </div>
      ) : null}
      <section className="sk-fly-from-left grid min-w-0 gap-3 xl:grid-cols-[1.2fr_0.8fr]">
        <RepoCard data={data} locale={locale} onCopy={copy} copied={copied} copiedText={text.copied} />
        <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <MiniInfo
            title={text.live}
            icon={<Activity className="size-4" />}
            value={data ? formatDate(data.generatedAt, locale) : "—"}
            note="auto refresh · 15s"
          />
          <MiniInfo
            title={text.defaultBranch}
            icon={<GitBranch className="size-4" />}
            value={data?.repository?.defaultBranch ?? "—"}
            note={data?.repository?.license ?? "license —"}
          />
        </div>
      </section>
      <section id="graphs" className="sk-fly-from-right flex min-w-0 flex-col gap-3">
        <CopyableTitle
          id="graphs"
          title={text.graphs}
          onCopy={copy}
          copied={copied === "graphs"}
          copiedText={text.copied}
          small
        />
        <div className="grid min-w-0 gap-3 xl:grid-cols-3">
          <ActivityChart data={data?.stats.days ?? []} />
          <LanguageChart data={data?.languages ?? []} />
          <EventChart data={data?.stats.eventTypes ?? []} />
        </div>
      </section>
      <section id="contributors" className="sk-fly-from-left flex min-w-0 flex-col gap-3">
        <CopyableTitle
          id="contributors"
          title={text.contributorActivity}
          onCopy={copy}
          copied={copied === "contributors"}
          copiedText={text.copied}
          small
        />
        <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(data?.contributors ?? []).slice(0, 6).map((contributor, index) => (
            <ContributorCard
              key={contributor.login}
              contributor={contributor}
              maxScore={max((data?.contributors ?? []).map((c) => c.score))}
              index={index}
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
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder={text.search}
              className="h-11 w-full rounded-2xl border border-panel-border bg-control pl-10 pr-3 font-mono text-[12px] lowercase outline-none transition-colors placeholder:text-text-faint focus:border-ring"
            />
          </label>
          <SelectControl
            icon={<Filter className="size-3.5" />}
            value={filter}
            onChange={(v) => {
              setFilter(v as ItemFilter);
              setPage(1);
            }}
            options={["all", "commits", "events", "merges"]}
          />
          <SelectControl
            icon={<ArrowDownAZ className="size-3.5" />}
            value={sort}
            onChange={(v) => setSort(v as SortKey)}
            options={["newest", "oldest", "author", "branch", "type", "title"]}
          />
          <SelectControl
            icon={<GitBranch className="size-3.5" />}
            value={branch}
            onChange={(v) => {
              setBranch(v);
              setPage(1);
            }}
            options={["all", ...(data?.branches ?? []).map((b) => b.name)]}
          />
          <SelectControl
            icon={<Users className="size-3.5" />}
            value={author}
            onChange={(v) => {
              setAuthor(v);
              setPage(1);
            }}
            options={["all", ...(data?.contributors ?? []).map((c) => c.login)]}
          />
          <SelectControl
            value={String(pageSize)}
            onChange={(v) => {
              setPageSize(Number(v) as PageSize);
              setPage(1);
            }}
            options={PAGE_SIZES.map(String)}
          />
        </div>
      </section>
      <section id="log" className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <CopyableTitle
            id="log"
            title={text.feed}
            onCopy={copy}
            copied={copied === "log"}
            copiedText={text.copied}
            small
          />
          <div className="font-mono text-[11px] lowercase text-text-faint">
            {filtered.length} · {safePage}/{totalPages}
          </div>
        </div>
        {loading && !data ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-24 rounded-3xl border border-panel-border bg-panel-soft/70" />
            ))}
          </div>
        ) : (
          <div className="flex min-w-0 flex-col gap-3">
            {paginated.map((item, index) => (
              <ChangelogRow
                key={item.id}
                item={item}
                index={index}
                onCopy={copy}
                copied={copied === item.slug}
                copiedText={text.copied}
                locale={locale}
              />
            ))}
          </div>
        )}
        <Pagination page={safePage} totalPages={totalPages} setPage={setPage} />
      </section>
      <section id="repo-lists" className="sk-fly-from-bottom grid min-w-0 gap-3 xl:grid-cols-3">
        <BranchList branches={data?.branches ?? []} />
        <SmallList
          title={text.releasesTags}
          icon={<Tags className="size-4" />}
          rows={[
            ...(data?.releases ?? []).map((r) => ({ title: r.name, meta: r.tag ?? "release", url: r.url })),
            ...(data?.tags ?? [])
              .slice(0, 8)
              .map((tag) => ({ title: tag.name, meta: tag.sha?.slice(0, 7) ?? "tag", url: null })),
          ]}
        />
        <SmallList
          title="issues / pull requests"
          icon={<GitPullRequest className="size-4" />}
          rows={[
            ...(data?.pulls.recent ?? [])
              .slice(0, 6)
              .map((p) => ({ title: p.title, meta: `pr #${p.number} · ${p.state}`, url: p.url })),
            ...(data?.issues.recent ?? [])
              .slice(0, 6)
              .map((i) => ({ title: i.title, meta: `issue #${i.number} · ${i.state}`, url: i.url })),
          ]}
        />
      </section>
    </div>
  );
}
function CopyableTitle({
  id,
  title,
  onCopy,
  copied,
  copiedText,
  small = false,
}: {
  id: string;
  title: string;
  onCopy: (id: string) => void;
  copied: boolean;
  copiedText: string;
  small?: boolean;
}) {
  return (
    <button
      id={id}
      onClick={() => onCopy(id)}
      className="group flex w-fit max-w-full min-w-0 items-center gap-2 text-left"
    >
      <span
        className={
          small
            ? "font-mono text-lg font-bold lowercase text-foreground"
            : "font-mono text-3xl font-black lowercase tracking-tight text-foreground sm:text-4xl"
        }
      >
        {title}
      </span>
      <Copy className="size-4 shrink-0 text-text-faint opacity-0 transition-opacity group-hover:opacity-100" />
      {copied ? <span className="font-mono text-[11px] lowercase text-text-faint">{copiedText}</span> : null}
    </button>
  );
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
  );
}
function RepoCard({
  data,
  locale,
  onCopy,
  copied,
  copiedText,
}: {
  data: ChangelogData | null;
  locale: string;
  onCopy: (id: string) => void;
  copied: string | null;
  copiedText: string;
}) {
  const repo = data?.repository;
  return (
    <article className="min-w-0 rounded-3xl border border-panel-border bg-panel-soft p-5">
      <CopyableTitle
        id="repository"
        title={repo?.name ?? data?.repo ?? "program-perfect/mixture"}
        onCopy={onCopy}
        copied={copied === "repository"}
        copiedText={copiedText}
        small
      />
      <p className="mt-3 max-w-3xl font-mono text-[13px] lowercase leading-relaxed text-text-secondary">
        {repo?.description ?? "live GitHub repository metadata"}
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <RepoMetric icon={<Star className="size-4" />} label="stars" value={repo?.stars ?? 0} />
        <RepoMetric icon={<GitBranch className="size-4" />} label="forks" value={repo?.forks ?? 0} />
        <RepoMetric icon={<GitPullRequest className="size-4" />} label="open" value={repo?.openIssues ?? 0} />
        <RepoMetric icon={<Code2 className="size-4" />} label="size" value={`${repo?.size ?? 0}kb`} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2 font-mono text-[11px] lowercase text-text-faint">
        <span className="rounded-xl bg-control px-2.5 py-1">pushed · {formatDate(repo?.pushedAt, locale)}</span>
        <span className="rounded-xl bg-control px-2.5 py-1">updated · {formatDate(repo?.updatedAt, locale)}</span>
        {repo?.url ? (
          <a
            href={repo.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-xl bg-control px-2.5 py-1 hover:text-foreground"
          >
            github <ExternalLink className="size-3" />
          </a>
        ) : null}
      </div>
    </article>
  );
}
function RepoMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-panel-border bg-control p-3">
      <div className="mb-2 flex justify-between text-text-muted">
        <span className="font-mono text-[10px] lowercase">{label}</span>
        {icon}
      </div>
      <div className="font-mono text-lg font-bold text-foreground">{value}</div>
    </div>
  );
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
  );
}
function ActivityChart({ data }: { data: DayStat[] }) {
  const rows = data.slice(-24);
  const peak = max(rows.map((d) => d.total));
  return (
    <ChartCard title="activity">
      <div className="flex h-44 items-end gap-1.5">
        {rows.map((d, i) => (
          <div
            key={d.day}
            className="sk-chart-bar flex flex-1 flex-col items-center justify-end gap-1"
            style={{ "--sk-delay": `${i * 18}ms` } as React.CSSProperties}
          >
            <div
              className="w-full rounded-t-lg bg-control-active"
              style={{ height: `${Math.max(6, (d.total / peak) * 100)}%` }}
            />
            <span className="hidden font-mono text-[9px] text-text-faint sm:block">{d.day.slice(5)}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
function LanguageChart({ data }: { data: LanguageStat[] }) {
  return (
    <ChartCard title="languages">
      <div className="flex flex-col gap-3">
        {data.slice(0, 7).map((lang, i) => (
          <div key={lang.name} className="sk-animate-in" style={{ "--sk-delay": `${i * 45}ms` } as React.CSSProperties}>
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
  );
}
function EventChart({ data }: { data: { type: string; count: number }[] }) {
  const peak = max(data.map((d) => d.count));
  return (
    <ChartCard title="events">
      <div className="flex flex-col gap-2">
        {data.slice(0, 8).map((event, i) => (
          <div
            key={event.type}
            className="grid grid-cols-[86px_minmax(0,1fr)_32px] items-center gap-2 font-mono text-[11px] lowercase"
          >
            <span className="truncate text-text-secondary">{event.type.replace(/Event$/, "")}</span>
            <div className="h-2 overflow-hidden rounded-full bg-control">
              <div
                className="sk-chart-line h-full rounded-full bg-control-active"
                style={
                  {
                    width: `${Math.max(4, (event.count / peak) * 100)}%`,
                    "--sk-delay": `${i * 45}ms`,
                  } as React.CSSProperties
                }
              />
            </div>
            <span className="text-right text-text-faint">{event.count}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
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
  );
}
function ContributorCard({
  contributor,
  maxScore,
  index,
}: {
  contributor: ContributorStats;
  maxScore: number;
  index: number;
}) {
  return (
    <article
      className="sk-animate-in min-w-0 rounded-3xl border border-panel-border bg-panel-soft p-4"
      style={{ "--sk-delay": `${index * 55}ms` } as React.CSSProperties}
    >
      <div className="flex items-center gap-3">
        <div className="size-11 overflow-hidden rounded-2xl border border-panel-border bg-control">
          {contributor.avatarUrl ? (
            <img src={contributor.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="min-w-0">
          <div className="truncate font-mono text-sm font-bold text-foreground">{contributor.login}</div>
          <div className="font-mono text-[11px] lowercase text-text-faint">score · {contributor.score}</div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center font-mono text-[11px] lowercase">
        <span className="rounded-xl bg-control p-2">
          {contributor.commits}
          <br />
          commits
        </span>
        <span className="rounded-xl bg-control p-2">
          {contributor.events}
          <br />
          events
        </span>
        <span className="rounded-xl bg-control p-2">
          {contributor.contributions}
          <br />
          github
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-control">
        <div
          className="h-full rounded-full bg-control-active"
          style={{ width: `${Math.max(4, (contributor.score / maxScore) * 100)}%` }}
        />
      </div>
    </article>
  );
}
function SelectControl({
  value,
  onChange,
  options,
  icon,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  icon?: React.ReactNode;
}) {
  return (
    <label className="relative min-w-0">
      {icon ? (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-faint">{icon}</span>
      ) : null}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-11 w-full rounded-2xl border border-panel-border bg-control ${icon ? "pl-9" : "pl-3"} pr-8 font-mono text-[12px] lowercase outline-none focus:border-ring`}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
function ChangelogRow({
  item,
  index,
  onCopy,
  copied,
  copiedText,
  locale,
}: {
  item: ChangelogItem;
  index: number;
  onCopy: (slug: string) => void;
  copied: boolean;
  copiedText: string;
  locale: string;
}) {
  const commit = isCommit(item);
  const Icon = commit ? (item.parentCount > 1 ? GitMerge : GitCommitHorizontal) : Radio;
  const href = item.url;
  return (
    <article
      id={item.slug}
      className="sk-animate-in group relative min-w-0 rounded-3xl border border-panel-border bg-panel-soft p-4 transition-colors hover:bg-panel-hover sm:p-5"
      style={{ "--sk-delay": `${Math.min(index * 35, 320)}ms` } as React.CSSProperties}
    >
      <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-panel-border bg-control px-2.5 py-1 font-mono text-[11px] lowercase text-text-muted">
              <Icon className="size-3.5" /> {commit ? item.shortSha : itemType(item)}
            </span>
            <span className="font-mono text-[11px] lowercase text-text-faint">{formatDate(item.date, locale)}</span>
          </div>
          <button onClick={() => onCopy(item.slug)} className="flex max-w-full items-center gap-2 text-left">
            <h3 className="min-w-0 break-words font-mono text-[15px] font-bold lowercase leading-snug text-foreground sm:text-base">
              {item.title}
            </h3>
            <Copy className="size-3.5 shrink-0 text-text-faint opacity-0 transition-opacity group-hover:opacity-100" />
            {copied ? <span className="font-mono text-[10px] text-text-faint">{copiedText}</span> : null}
          </button>
          <p className="mt-2 line-clamp-3 break-words font-mono text-[12px] leading-relaxed text-text-secondary sm:text-[13px]">
            {commit ? item.body || `author: ${item.author}` : item.description}
          </p>
        </div>
        <div className="flex min-w-0 shrink-0 flex-wrap items-center gap-2 xl:max-w-[42%] xl:justify-end">
          {itemBranches(item)
            .slice(0, 5)
            .map((b) => (
              <span
                key={b}
                className="max-w-full truncate rounded-xl border border-panel-border bg-control px-2.5 py-1 font-mono text-[11px] lowercase text-text-secondary"
              >
                {b}
              </span>
            ))}
          <span className="max-w-full truncate rounded-xl bg-control px-2.5 py-1 font-mono text-[11px] lowercase text-text-faint">
            {itemActor(item)}
          </span>
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-control px-2.5 py-1 text-text-faint hover:text-foreground"
            >
              <ExternalLink className="size-3.5" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
function Pagination({
  page,
  totalPages,
  setPage,
}: {
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
}) {
  const pages = Array.from(
    { length: Math.min(totalPages, 7) },
    (_, i) => Math.max(1, Math.min(totalPages - 6, page - 3)) + i,
  );
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button
        disabled={page <= 1}
        onClick={() => setPage(page - 1)}
        className="rounded-xl bg-control px-3 py-2 font-mono text-[12px] lowercase disabled:opacity-35"
      >
        prev
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => setPage(p)}
          className={
            p === page
              ? "rounded-xl bg-control-active px-3 py-2 font-mono text-[12px] lowercase text-control-active-foreground"
              : "rounded-xl bg-control px-3 py-2 font-mono text-[12px] lowercase text-text-secondary"
          }
        >
          {p}
        </button>
      ))}
      <button
        disabled={page >= totalPages}
        onClick={() => setPage(page + 1)}
        className="rounded-xl bg-control px-3 py-2 font-mono text-[12px] lowercase disabled:opacity-35"
      >
        next
      </button>
    </div>
  );
}
function BranchList({ branches }: { branches: BranchStats[] }) {
  const peak = max(branches.map((b) => b.commits));
  return (
    <SmallList
      title="branches"
      icon={<GitBranch className="size-4" />}
      rows={branches
        .slice(0, 14)
        .map((b) => ({
          title: b.name,
          meta: `${b.commits} commits${b.protected ? " · protected" : ""}`,
          width: `${Math.max(4, (b.commits / peak) * 100)}%`,
        }))}
    />
  );
}
function SmallList({
  title,
  icon,
  rows,
}: {
  title: string;
  icon: React.ReactNode;
  rows: { title: string; meta: string; url?: string | null; width?: string }[];
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
            );
            return row.url ? (
              <a
                key={`${row.title}-${row.meta}`}
                href={row.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl bg-control p-3 hover:bg-panel-hover"
              >
                {body}
              </a>
            ) : (
              <div key={`${row.title}-${row.meta}`} className="rounded-2xl bg-control p-3">
                {body}
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl bg-control p-3 font-mono text-[12px] lowercase text-text-faint">empty</div>
        )}
      </div>
    </div>
  );
}
