import { NextResponse } from "next/server"

export const revalidate = 120

const OWNER = "program-perfect"
const REPO = "mixture"
const API = "https://api.github.com"
const MAX_COMMIT_PAGES_PER_BRANCH = 10
const MAX_EVENT_PAGES = 3

type BranchResponse = {
  name: string
  commit?: {
    sha?: string
  }
}

type CommitResponse = {
  sha: string
  html_url?: string
  commit?: {
    message?: string
    author?: {
      name?: string
      email?: string
      date?: string
    }
    committer?: {
      name?: string
      date?: string
    }
  }
  author?: {
    login?: string
    avatar_url?: string
    html_url?: string
  } | null
  committer?: {
    login?: string
    avatar_url?: string
    html_url?: string
  } | null
  parents?: { sha: string }[]
}

type EventResponse = {
  id: string
  type: string
  created_at: string
  actor?: {
    login?: string
    avatar_url?: string
    url?: string
  }
  payload?: Record<string, unknown>
  public?: boolean
}

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

async function github<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "screenkit-changelog",
    },
    next: { revalidate },
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

function eventBranch(payload: Record<string, unknown> | undefined): string | null {
  const ref = payload?.ref
  if (typeof ref !== "string") return null
  return ref.replace(/^refs\/heads\//, "")
}

function eventUrl(payload: Record<string, unknown> | undefined): string | null {
  const pullRequest = payload?.pull_request
  if (
    pullRequest &&
    typeof pullRequest === "object" &&
    "html_url" in pullRequest &&
    typeof pullRequest.html_url === "string"
  ) {
    return pullRequest.html_url
  }

  const issue = payload?.issue
  if (
    issue &&
    typeof issue === "object" &&
    "html_url" in issue &&
    typeof issue.html_url === "string"
  ) {
    return issue.html_url
  }

  const release = payload?.release
  if (
    release &&
    typeof release === "object" &&
    "html_url" in release &&
    typeof release.html_url === "string"
  ) {
    return release.html_url
  }

  return null
}

function describeEvent(event: EventResponse): ChangelogEvent {
  const payload = event.payload ?? {}
  const actor = event.actor?.login ?? "github"
  const branch = eventBranch(payload)
  const type = event.type.replace(/Event$/, "")

  let title = type
  let description = "событие репозитория"

  if (event.type === "PushEvent") {
    const commits = Array.isArray(payload.commits) ? payload.commits.length : 0
    title = `push${branch ? ` в ${branch}` : ""}`
    description = commits ? `${commits} commit${commits === 1 ? "" : "s"}` : "обновление ветки"
  } else if (event.type === "CreateEvent") {
    const refType = typeof payload.ref_type === "string" ? payload.ref_type : "ref"
    title = `создан ${refType}`
    description = branch ? branch : "новая сущность в репозитории"
  } else if (event.type === "DeleteEvent") {
    const refType = typeof payload.ref_type === "string" ? payload.ref_type : "ref"
    title = `удалён ${refType}`
    description = branch ? branch : "удаление сущности в репозитории"
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
    description = "изменение релиза"
  }

  return {
    id: `event-${event.id}`,
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

export async function GET() {
  try {
    const branches = await github<BranchResponse[]>(`/repos/${OWNER}/${REPO}/branches?per_page=100`)

    const commitMap = new Map<string, ChangelogCommit>()

    await Promise.all(
      branches.map(async (branch) => {
        const commits = await githubPages<CommitResponse>(
          `/repos/${OWNER}/${REPO}/commits?sha=${encodeURIComponent(branch.name)}`,
          MAX_COMMIT_PAGES_PER_BRANCH,
        ).catch(() => [])

        for (const commit of commits) {
          const existing = commitMap.get(commit.sha)
          if (existing) {
            if (!existing.branches.includes(branch.name)) existing.branches.push(branch.name)
            continue
          }

          const message = commit.commit?.message ?? ""
          commitMap.set(commit.sha, {
            id: `commit-${commit.sha}`,
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

    return NextResponse.json({
      repo: `${OWNER}/${REPO}`,
      generatedAt: new Date().toISOString(),
      source: "github",
      branches: branches.map((branch) => ({
        name: branch.name,
        sha: branch.commit?.sha ?? null,
      })),
      commits,
      events,
      items,
      limits: {
        commitPagesPerBranch: MAX_COMMIT_PAGES_PER_BRANCH,
        eventPages: MAX_EVENT_PAGES,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        repo: `${OWNER}/${REPO}`,
        generatedAt: new Date().toISOString(),
        source: "github",
        branches: [],
        commits: [],
        events: [],
        items: [],
        error: error instanceof Error ? error.message : "unknown changelog error",
      },
      { status: 200 },
    )
  }
}
