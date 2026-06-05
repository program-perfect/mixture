import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

const OWNER = "program-perfect"
const REPO = "mixture"
const API = "https://api.github.com"
const MAX_COMMIT_PAGES_PER_BRANCH = 10
const MAX_EVENT_PAGES = 5

type RepositoryResponse = {
  full_name: string
  html_url?: string
  description?: string | null
  private?: boolean
  fork?: boolean
  default_branch?: string
  language?: string | null
  stargazers_count?: number
  watchers_count?: number
  forks_count?: number
  open_issues_count?: number
  size?: number
  created_at?: string
  updated_at?: string
  pushed_at?: string
  license?: { spdx_id?: string | null; name?: string | null } | null
  owner?: { login?: string; avatar_url?: string; html_url?: string }
}

type BranchResponse = {
  name: string
  protected?: boolean
  commit?: { sha?: string; url?: string }
}

type CommitResponse = {
  sha: string
  html_url?: string
  commit?: {
    message?: string
    author?: { name?: string; email?: string; date?: string }
    committer?: { name?: string; date?: string }
  }
  author?: { login?: string; avatar_url?: string; html_url?: string } | null
  committer?: { login?: string; avatar_url?: string; html_url?: string } | null
  parents?: { sha: string }[]
}

type EventResponse = {
  id: string
  type: string
  created_at: string
  actor?: { login?: string; avatar_url?: string; url?: string }
  payload?: Record<string, unknown>
  public?: boolean
}

type ContributorResponse = {
  login?: string
  avatar_url?: string
  html_url?: string
  contributions?: number
  type?: string
}

type ReleaseResponse = {
  id: number
  name?: string | null
  tag_name?: string
  html_url?: string
  draft?: boolean
  prerelease?: boolean
  published_at?: string | null
  created_at?: string
}

type TagResponse = {
  name: string
  zipball_url?: string
  tarball_url?: string
  commit?: { sha?: string; url?: string }
}

type IssueLikeResponse = {
  id: number
  number?: number
  title?: string
  html_url?: string
  state?: string
  created_at?: string
  updated_at?: string
  user?: { login?: string; avatar_url?: string }
  pull_request?: unknown
}

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
  additions?: number
  deletions?: number
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

type DayStats = {
  day: string
  commits: number
  events: number
  total: number
}

type BranchStats = {
  name: string
  sha: string | null
  protected: boolean
  commits: number
  lastCommitAt: string | null
}

type LanguageStat = {
  name: string
  bytes: number
  percent: number
}

async function github<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "screenkit-changelog",
    },
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`GitHub ${res.status}: ${path}`)
  }

  return (await res.json()) as T
}

async function githubPages<T>(path: string, maxPages: number): Promise<T[]> {
  const rows: T[] = []

  for (let page = 1; page <= maxPages; page += 1) {
    const separator = path.includes("?") ? "&" : "?"
    const chunk = await github<T[]>(`${path}${separator}per_page=100&page=${page}`)
    rows.push(...chunk)
    if (chunk.length < 100) break
  }

  return rows
}

function firstLine(message: string | undefined): string {
  return (message ?? "untitled commit").split("\n")[0]?.trim() || "untitled commit"
}

function restLines(message: string | undefined): string {
  return (message ?? "")
    .split("\n")
    .slice(1)
    .join("\n")
    .trim()
}

function dayIso(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "unknown"
  return date.toISOString().slice(0, 10)
}

function eventBranch(payload: Record<string, unknown> | undefined): string | null {
  const ref = payload?.ref
  if (typeof ref !== "string") return null
  return ref.replace(/^refs\/heads\//, "")
}

function eventUrl(payload: Record<string, unknown> | undefined): string | null {
  for (const key of ["pull_request", "issue", "release"] as const) {
    const value = payload?.[key]
    if (
      value &&
      typeof value === "object" &&
      "html_url" in value &&
      typeof value.html_url === "string"
    ) {
      return value.html_url
    }
  }

  return null
}

function describeEvent(event: EventResponse): ChangelogEvent {
  const payload = event.payload ?? {}
  const actor = event.actor?.login ?? "github"
  const branch = eventBranch(payload)
  const type = event.type.replace(/Event$/, "")

  let title = type
  let description = "repository event"

  if (event.type === "PushEvent") {
    const commits = Array.isArray(payload.commits) ? payload.commits.length : 0
    title = `push${branch ? ` · ${branch}` : ""}`
    description = commits ? `${commits} commit${commits === 1 ? "" : "s"}` : "branch update"
  } else if (event.type === "CreateEvent") {
    const refType = typeof payload.ref_type === "string" ? payload.ref_type : "ref"
    title = `created ${refType}`
    description = branch ? branch : "new repository ref"
  } else if (event.type === "DeleteEvent") {
    const refType = typeof payload.ref_type === "string" ? payload.ref_type : "ref"
    title = `deleted ${refType}`
    description = branch ? branch : "removed repository ref"
  } else if (event.type === "PullRequestEvent") {
    const action = typeof payload.action === "string" ? payload.action : "updated"
    const pr = payload.pull_request
    const prTitle =
      pr && typeof pr === "object" && "title" in pr && typeof pr.title === "string"
        ? pr.title
        : "pull request"
    title = `pull request · ${action}`
    description = prTitle
  } else if (event.type === "IssuesEvent") {
    const action = typeof payload.action === "string" ? payload.action : "updated"
    const issue = payload.issue
    const issueTitle =
      issue && typeof issue === "object" && "title" in issue && typeof issue.title === "string"
        ? issue.title
        : "issue"
    title = `issue · ${action}`
    description = issueTitle
  } else if (event.type === "ReleaseEvent") {
    const action = typeof payload.action === "string" ? payload.action : "updated"
    title = `release · ${action}`
    description = "release update"
  }

  return {
    id: `event-${event.id}`,
    slug: `event-${event.id}`,
    kind: "event",
    eventType: event.type,
    title,
    description,
    date: event.created_at,
    actor,
    avatarUrl: event.actor?.avatar_url ?? null,
    branch,
    url: eventUrl(payload),
  }
}

function latest(values: (string | null | undefined)[]): string | null {
  const sorted = values
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  return sorted[0] ?? null
}

function buildContributorStats(
  contributorsRaw: ContributorResponse[],
  commits: ChangelogCommit[],
  events: ChangelogEvent[],
): ContributorStats[] {
  const map = new Map<string, ContributorStats>()

  for (const contributor of contributorsRaw) {
    const login = contributor.login ?? "unknown"
    map.set(login, {
      login,
      avatarUrl: contributor.avatar_url ?? null,
      url: contributor.html_url ?? null,
      contributions: contributor.contributions ?? 0,
      commits: 0,
      events: 0,
      lastActiveAt: null,
      score: contributor.contributions ?? 0,
    })
  }

  for (const commit of commits) {
    const login = commit.authorLogin ?? commit.author
    const current = map.get(login) ?? {
      login,
      avatarUrl: commit.avatarUrl,
      url: null,
      contributions: 0,
      commits: 0,
      events: 0,
      lastActiveAt: null,
      score: 0,
    }
    current.commits += 1
    current.lastActiveAt = latest([current.lastActiveAt, commit.date])
    current.score = current.contributions + current.commits * 3 + current.events
    if (!current.avatarUrl) current.avatarUrl = commit.avatarUrl
    map.set(login, current)
  }

  for (const event of events) {
    const current = map.get(event.actor) ?? {
      login: event.actor,
      avatarUrl: event.avatarUrl,
      url: null,
      contributions: 0,
      commits: 0,
      events: 0,
      lastActiveAt: null,
      score: 0,
    }
    current.events += 1
    current.lastActiveAt = latest([current.lastActiveAt, event.date])
    current.score = current.contributions + current.commits * 3 + current.events
    if (!current.avatarUrl) current.avatarUrl = event.avatarUrl
    map.set(event.actor, current)
  }

  return [...map.values()].sort((a, b) => b.score - a.score)
}

function buildDayStats(commits: ChangelogCommit[], events: ChangelogEvent[]): DayStats[] {
  const map = new Map<string, DayStats>()
  for (const commit of commits) {
    const day = dayIso(commit.date)
    const stat = map.get(day) ?? { day, commits: 0, events: 0, total: 0 }
    stat.commits += 1
    stat.total += 1
    map.set(day, stat)
  }
  for (const event of events) {
    const day = dayIso(event.date)
    const stat = map.get(day) ?? { day, commits: 0, events: 0, total: 0 }
    stat.events += 1
    stat.total += 1
    map.set(day, stat)
  }
  return [...map.values()].sort((a, b) => a.day.localeCompare(b.day))
}

function buildLanguageStats(languages: Record<string, number>): LanguageStat[] {
  const total = Object.values(languages).reduce((sum, value) => sum + value, 0)
  if (!total) return []
  return Object.entries(languages)
    .map(([name, bytes]) => ({ name, bytes, percent: Math.round((bytes / total) * 1000) / 10 }))
    .sort((a, b) => b.bytes - a.bytes)
}

export async function GET() {
  try {
    const [repo, branches, contributorsRaw, languagesRaw, releasesRaw, tagsRaw, issuesRaw, pullsRaw] = await Promise.all([
      github<RepositoryResponse>(`/repos/${OWNER}/${REPO}`),
      github<BranchResponse[]>(`/repos/${OWNER}/${REPO}/branches?per_page=100`),
      githubPages<ContributorResponse>(`/repos/${OWNER}/${REPO}/contributors`, 2).catch(() => []),
      github<Record<string, number>>(`/repos/${OWNER}/${REPO}/languages`).catch(() => ({})),
      githubPages<ReleaseResponse>(`/repos/${OWNER}/${REPO}/releases`, 1).catch(() => []),
      githubPages<TagResponse>(`/repos/${OWNER}/${REPO}/tags`, 1).catch(() => []),
      githubPages<IssueLikeResponse>(`/repos/${OWNER}/${REPO}/issues?state=all`, 1).catch(() => []),
      githubPages<IssueLikeResponse>(`/repos/${OWNER}/${REPO}/pulls?state=all`, 1).catch(() => []),
    ])

    const branchStats = new Map<string, BranchStats>()
    const commitMap = new Map<string, ChangelogCommit>()

    await Promise.all(
      branches.map(async (branch) => {
        const branchCommits = await githubPages<CommitResponse>(
          `/repos/${OWNER}/${REPO}/commits?sha=${encodeURIComponent(branch.name)}`,
          MAX_COMMIT_PAGES_PER_BRANCH,
        ).catch(() => [])

        branchStats.set(branch.name, {
          name: branch.name,
          sha: branch.commit?.sha ?? null,
          protected: Boolean(branch.protected),
          commits: branchCommits.length,
          lastCommitAt:
            branchCommits[0]?.commit?.committer?.date ?? branchCommits[0]?.commit?.author?.date ?? null,
        })

        for (const commit of branchCommits) {
          const existing = commitMap.get(commit.sha)
          if (existing) {
            if (!existing.branches.includes(branch.name)) existing.branches.push(branch.name)
            continue
          }

          const message = commit.commit?.message ?? ""
          commitMap.set(commit.sha, {
            id: `commit-${commit.sha}`,
            slug: `commit-${commit.sha.slice(0, 12)}`,
            kind: "commit",
            sha: commit.sha,
            shortSha: commit.sha.slice(0, 7),
            title: firstLine(message),
            body: restLines(message),
            date:
              commit.commit?.committer?.date ??
              commit.commit?.author?.date ??
              new Date().toISOString(),
            url: commit.html_url ?? null,
            author:
              commit.author?.login ??
              commit.commit?.author?.name ??
              commit.committer?.login ??
              "unknown",
            authorLogin: commit.author?.login ?? commit.committer?.login ?? null,
            avatarUrl: commit.author?.avatar_url ?? commit.committer?.avatar_url ?? null,
            branches: [branch.name],
            parentCount: commit.parents?.length ?? 0,
          })
        }
      }),
    )

    const eventsRaw = await githubPages<EventResponse>(
      `/repos/${OWNER}/${REPO}/events`,
      MAX_EVENT_PAGES,
    ).catch(() => [])
    const events = eventsRaw.map(describeEvent)
    const commits = [...commitMap.values()].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    const items = [...commits, ...events].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    const contributors = buildContributorStats(contributorsRaw, commits, events)
    const dayStats = buildDayStats(commits, events)
    const eventTypeStats = Object.entries(
      events.reduce<Record<string, number>>((acc, event) => {
        acc[event.eventType] = (acc[event.eventType] ?? 0) + 1
        return acc
      }, {}),
    )
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)

    const openIssues = issuesRaw.filter((issue) => !issue.pull_request && issue.state === "open")
    const closedIssues = issuesRaw.filter((issue) => !issue.pull_request && issue.state === "closed")
    const openPulls = pullsRaw.filter((pull) => pull.state === "open")
    const closedPulls = pullsRaw.filter((pull) => pull.state === "closed")

    return NextResponse.json(
      {
        repo: `${OWNER}/${REPO}`,
        generatedAt: new Date().toISOString(),
        source: "github-live",
        repository: {
          name: repo.full_name,
          url: repo.html_url ?? null,
          description: repo.description ?? null,
          private: Boolean(repo.private),
          fork: Boolean(repo.fork),
          defaultBranch: repo.default_branch ?? "main",
          primaryLanguage: repo.language ?? null,
          stars: repo.stargazers_count ?? 0,
          watchers: repo.watchers_count ?? 0,
          forks: repo.forks_count ?? 0,
          openIssues: repo.open_issues_count ?? 0,
          size: repo.size ?? 0,
          createdAt: repo.created_at ?? null,
          updatedAt: repo.updated_at ?? null,
          pushedAt: repo.pushed_at ?? null,
          license: repo.license?.spdx_id ?? repo.license?.name ?? null,
          owner: repo.owner
            ? {
                login: repo.owner.login ?? OWNER,
                avatarUrl: repo.owner.avatar_url ?? null,
                url: repo.owner.html_url ?? null,
              }
            : null,
        },
        branches: [...branchStats.values()].sort((a, b) => b.commits - a.commits),
        contributors,
        languages: buildLanguageStats(languagesRaw),
        releases: releasesRaw.map((release) => ({
          id: release.id,
          name: release.name || release.tag_name || "release",
          tag: release.tag_name ?? null,
          url: release.html_url ?? null,
          draft: Boolean(release.draft),
          prerelease: Boolean(release.prerelease),
          publishedAt: release.published_at ?? release.created_at ?? null,
        })),
        tags: tagsRaw.map((tag) => ({
          name: tag.name,
          sha: tag.commit?.sha ?? null,
          zipballUrl: tag.zipball_url ?? null,
          tarballUrl: tag.tarball_url ?? null,
        })),
        issues: {
          open: openIssues.length,
          closed: closedIssues.length,
          recent: issuesRaw
            .filter((issue) => !issue.pull_request)
            .slice(0, 12)
            .map((issue) => ({
              id: issue.id,
              number: issue.number ?? null,
              title: issue.title ?? "issue",
              state: issue.state ?? "unknown",
              url: issue.html_url ?? null,
              updatedAt: issue.updated_at ?? null,
              author: issue.user?.login ?? "unknown",
              avatarUrl: issue.user?.avatar_url ?? null,
            })),
        },
        pulls: {
          open: openPulls.length,
          closed: closedPulls.length,
          recent: pullsRaw.slice(0, 12).map((pull) => ({
            id: pull.id,
            number: pull.number ?? null,
            title: pull.title ?? "pull request",
            state: pull.state ?? "unknown",
            url: pull.html_url ?? null,
            updatedAt: pull.updated_at ?? null,
            author: pull.user?.login ?? "unknown",
            avatarUrl: pull.user?.avatar_url ?? null,
          })),
        },
        stats: {
          days: dayStats,
          eventTypes: eventTypeStats,
          totals: {
            commits: commits.length,
            events: events.length,
            branches: branches.length,
            contributors: contributors.length,
            releases: releasesRaw.length,
            tags: tagsRaw.length,
            languages: Object.keys(languagesRaw).length,
          },
        },
        commits,
        events,
        items,
        limits: {
          commitPagesPerBranch: MAX_COMMIT_PAGES_PER_BRANCH,
          eventPages: MAX_EVENT_PAGES,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    )
  } catch (error) {
    return NextResponse.json(
      {
        repo: `${OWNER}/${REPO}`,
        generatedAt: new Date().toISOString(),
        source: "github-live",
        repository: null,
        branches: [],
        contributors: [],
        languages: [],
        releases: [],
        tags: [],
        issues: { open: 0, closed: 0, recent: [] },
        pulls: { open: 0, closed: 0, recent: [] },
        stats: { days: [], eventTypes: [], totals: {} },
        commits: [],
        events: [],
        items: [],
        error: error instanceof Error ? error.message : "unknown changelog error",
      },
      { status: 200, headers: { "Cache-Control": "no-store, max-age=0" } },
    )
  }
}
