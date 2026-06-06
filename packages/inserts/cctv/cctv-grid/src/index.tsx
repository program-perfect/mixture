"use client"

import type { InsertSceneManifest, SceneProps } from "@screenkit/core"
import { Grain } from "@screenkit/core/grain"
import * as React from "react"

/* ------------------------------------------------------------------ *
 * manifest — claims the dedicated multi-camera grid insert
 * ------------------------------------------------------------------ */

export const CCTV_GRID_INSERT_ID = "gs-cctv-grid"

export const manifest: InsertSceneManifest = {
  key: "cctv-grid",
  label: "1234 CCTV grid / multiplexer",
  inserts: [CCTV_GRID_INSERT_ID],
  categories: ["cctv"],
  priority: 1000,
}

/* ------------------------------------------------------------------ *
 * shared config — persisted so the fullscreen viewer (which has no
 * access to the app store) can read the same setup as the preview panel
 * ------------------------------------------------------------------ */

export type CctvLayout = "auto" | "2x2" | "3x3" | "4x4"

export type CctvConfig = {
  /** raw text the user pastes: a cloud folder link, or direct links (one per line) */
  source: string
  layout: CctvLayout
  labels: boolean
  timestamp: boolean
  monochrome: boolean
}

export const DEFAULT_CCTV_CONFIG: CctvConfig = {
  source: "",
  layout: "auto",
  labels: true,
  timestamp: true,
  monochrome: false,
}

const STORAGE_PREFIX = "screenkit.cctv."

export function cctvStorageKey(insertId: string) {
  return `${STORAGE_PREFIX}${insertId}`
}

export function readCctvConfig(insertId: string): CctvConfig {
  if (typeof window === "undefined") return DEFAULT_CCTV_CONFIG
  try {
    const raw = window.localStorage.getItem(cctvStorageKey(insertId))
    if (!raw) return DEFAULT_CCTV_CONFIG
    const parsed = JSON.parse(raw) as Partial<CctvConfig>
    return { ...DEFAULT_CCTV_CONFIG, ...parsed }
  } catch {
    return DEFAULT_CCTV_CONFIG
  }
}

export function writeCctvConfig(insertId: string, config: CctvConfig) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(cctvStorageKey(insertId), JSON.stringify(config))
  } catch {
    // ignore quota / privacy-mode failures
  }
}

/* ------------------------------------------------------------------ *
 * cloud-link resolution
 *   - direct video files (.mp4/.webm/.mov/…) pass straight through
 *   - Google Drive file links → direct download url
 *   - Dropbox share links → raw streaming host
 *   - Yandex.Disk public links (file or whole folder) → resolved via the
 *     free public REST API (lists every video inside a shared folder)
 * ------------------------------------------------------------------ */

export type CctvFeed = { url: string; label: string }

const VIDEO_EXT = /\.(mp4|webm|ogg|ogv|mov|m4v|mkv)(\?|#|$)/i
const YANDEX_API = "https://cloud-api.yandex.net/v1/disk/public/resources"

function parseTokens(raw: string): string[] {
  return raw
    .split(/[\n,;\s]+/)
    .map((t) => t.trim())
    .filter(Boolean)
}

function isYandex(token: string) {
  return /(^|\/\/)(disk\.yandex\.|yadi\.sk)/i.test(token)
}

function googleDriveId(token: string): string | null {
  const byPath = token.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (byPath) return byPath[1]
  const byQuery = token.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (byQuery && /drive\.google|docs\.google/.test(token)) return byQuery[1]
  return null
}

function normalizeStatic(token: string): string | null {
  // direct video file
  if (VIDEO_EXT.test(token)) return token

  // google drive single file
  const gid = googleDriveId(token)
  if (gid) return `https://drive.google.com/uc?export=download&id=${gid}`

  // dropbox share link → direct streaming host
  if (/dropbox\.com/i.test(token)) {
    return token
      .replace(/www\.dropbox\.com/i, "dl.dropboxusercontent.com")
      .replace(/([?&])dl=\d/i, "$1raw=1")
  }

  return null
}

async function resolveYandex(publicUrl: string, signal: AbortSignal): Promise<CctvFeed[]> {
  const base = `${YANDEX_API}?public_key=${encodeURIComponent(publicUrl)}&limit=200&sort=name`
  const res = await fetch(base, { signal })
  if (!res.ok) return []
  const meta = (await res.json()) as YandexResource

  const downloadHref = async (path?: string) => {
    const u = new URL(`${YANDEX_API}/download`)
    u.searchParams.set("public_key", publicUrl)
    if (path) u.searchParams.set("path", path)
    const r = await fetch(u.toString(), { signal })
    if (!r.ok) return null
    const j = (await r.json()) as { href?: string }
    return j.href ?? null
  }

  // a single shared file
  if (meta.type === "file") {
    if (!isVideoResource(meta)) return []
    const href = (await downloadHref()) ?? meta.file ?? null
    return href ? [{ url: href, label: meta.name }] : []
  }

  // a shared folder — collect every video child
  const items = meta._embedded?.items ?? []
  const videos = items.filter(isVideoResource)
  const feeds = await Promise.all(
    videos.map(async (item) => {
      const href = (await downloadHref(item.path)) ?? item.file ?? null
      return href ? { url: href, label: item.name } : null
    }),
  )
  return feeds.filter((f): f is CctvFeed => Boolean(f))
}

function isVideoResource(item: YandexResource) {
  if (item.type !== "file") return false
  if (item.media_type === "video") return true
  if (item.mime_type?.startsWith("video/")) return true
  return VIDEO_EXT.test(item.name)
}

type YandexResource = {
  type: "dir" | "file"
  name: string
  path?: string
  file?: string
  media_type?: string
  mime_type?: string
  _embedded?: { items?: YandexResource[] }
}

function labelFromUrl(url: string, i: number): string {
  try {
    const u = new URL(url)
    const last = u.pathname.split("/").filter(Boolean).pop()
    if (last && VIDEO_EXT.test(last)) return decodeURIComponent(last)
  } catch {
    // ignore
  }
  return `feed ${String(i + 1).padStart(2, "0")}`
}

async function resolveFeeds(raw: string, signal: AbortSignal): Promise<CctvFeed[]> {
  const tokens = parseTokens(raw)
  const out: CctvFeed[] = []
  for (const token of tokens) {
    if (isYandex(token)) {
      try {
        out.push(...(await resolveYandex(token, signal)))
      } catch {
        // network/CORS failure → skip, placeholders will cover the slot
      }
      continue
    }
    const direct = normalizeStatic(token)
    if (direct) out.push({ url: direct, label: labelFromUrl(direct, out.length) })
  }
  return out
}

/* ------------------------------------------------------------------ *
 * adaptive grid shape — fills the whole stage with no gaps and adapts
 * the column/row count to the live aspect ratio of the screen
 * ------------------------------------------------------------------ */

function useStageAspect(ref: React.RefObject<HTMLDivElement | null>) {
  const [aspect, setAspect] = React.useState(16 / 9)
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      if (w > 0 && h > 0) setAspect(w / h)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return aspect
}

function gridShape(count: number, aspect: number, layout: CctvLayout) {
  if (layout !== "auto") {
    const k = layout === "2x2" ? 2 : layout === "3x3" ? 3 : 4
    return { cols: k, rows: k, cells: k * k }
  }
  const n = Math.max(1, count)
  let cols = Math.max(1, Math.round(Math.sqrt(n * aspect)))
  cols = Math.min(cols, n)
  const rows = Math.ceil(n / cols)
  return { cols, rows, cells: cols * rows }
}

/* ------------------------------------------------------------------ *
 * scene
 * ------------------------------------------------------------------ */

export function Scene({ insert, settings }: SceneProps) {
  const config = useResolvedConfig(insert.id, settings)
  const stageRef = React.useRef<HTMLDivElement | null>(null)
  const aspect = useStageAspect(stageRef)

  const [feeds, setFeeds] = React.useState<CctvFeed[]>([])
  const [status, setStatus] = React.useState<"idle" | "loading" | "ready" | "empty">("idle")

  React.useEffect(() => {
    const raw = config.source.trim()
    if (!raw) {
      setFeeds([])
      setStatus("idle")
      return
    }
    const controller = new AbortController()
    setStatus("loading")
    resolveFeeds(raw, controller.signal)
      .then((resolved) => {
        if (controller.signal.aborted) return
        setFeeds(resolved)
        setStatus(resolved.length ? "ready" : "empty")
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setFeeds([])
          setStatus("empty")
        }
      })
    return () => controller.abort()
  }, [config.source])

  const { cols, rows, cells } = gridShape(
    feeds.length || 4,
    aspect,
    config.layout,
  )

  // build exactly `cells` tiles, cycling the available feeds so the grid is
  // always completely filled (classic multiplexer behaviour, no empty gaps)
  const tiles = React.useArray
    ? []
    : Array.from({ length: cells }, (_, i) => {
        const feed = feeds.length ? feeds[i % feeds.length] : null
        return { feed, index: i }
      })

  return (
    <div
      ref={stageRef}
      role="img"
      aria-label="CCTV camera grid"
      className="absolute inset-0 bg-black"
      style={config.monochrome ? { filter: "grayscale(1) contrast(1.05)" } : undefined}
    >
      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: 0,
        }}
      >
        {tiles.map(({ feed, index }) => (
          <CameraTile
            key={index}
            index={index}
            feed={feed}
            insertDate={insert.date}
            showLabel={config.labels}
            showTimestamp={config.timestamp}
            offline={status === "empty" || status === "idle" || !feed}
          />
        ))}
      </div>

      {/* shared phosphor grain over the whole wall */}
      <Grain />
    </div>
  )
}

/** merge the live preview settings with the persisted config */
function useResolvedConfig(
  insertId: string,
  settings: SceneProps["settings"],
): CctvConfig {
  return React.useMemo(() => {
    const persisted = readCctvConfig(insertId)
    if (!settings) return persisted
    const s = settings as Record<string, unknown>
    const has = (k: string) => typeof s[k] !== "undefined"
    if (!has("cctvSource") && !has("cctvLayout")) return persisted
    return {
      source: typeof s.cctvSource === "string" ? (s.cctvSource as string) : persisted.source,
      layout: (s.cctvLayout as CctvLayout) ?? persisted.layout,
      labels: typeof s.cctvLabels === "boolean" ? (s.cctvLabels as boolean) : persisted.labels,
      timestamp:
        typeof s.cctvTimestamp === "boolean"
          ? (s.cctvTimestamp as boolean)
          : persisted.timestamp,
      monochrome:
        typeof s.cctvMonochrome === "boolean"
          ? (s.cctvMonochrome as boolean)
          : persisted.monochrome,
    }
    // settings object identity changes on every keystroke from the panel,
    // so we intentionally depend on the stringified relevant slice
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    insertId,
    settings &&
      JSON.stringify({
        s: (settings as Record<string, unknown>).cctvSource,
        l: (settings as Record<string, unknown>).cctvLayout,
        la: (settings as Record<string, unknown>).cctvLabels,
        t: (settings as Record<string, unknown>).cctvTimestamp,
        m: (settings as Record<string, unknown>).cctvMonochrome,
      }),
  ])
}

/* ------------------------------------------------------------------ *
 * a single camera cell
 * ------------------------------------------------------------------ */

function CameraTile({
  index,
  feed,
  insertDate,
  showLabel,
  showTimestamp,
  offline,
}: {
  index: number
  feed: CctvFeed | null
  insertDate: string
  showLabel: boolean
  showTimestamp: boolean
  offline: boolean
}) {
  const camNo = String(index + 1).padStart(2, "0")
  const clock = useCctvClock(index)

  return (
    <div className="relative overflow-hidden bg-[#05080a] outline outline-1 -outline-offset-[0.5px] outline-black/70">
      {feed ? (
        <video
          src={feed.url}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <NoSignal seed={index} />
      )}

      {/* per-camera scanlines for the CRT multiplexer feel */}
      <div className="pointer-events-none absolute inset-0 fx-scanlines opacity-70" />

      {/* corner vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* top-left camera label */}
      {showLabel && (
        <div className="absolute left-1 top-1 font-mono text-[10px] uppercase leading-none tracking-wide text-[#d6ffe1] drop-shadow-[0_1px_0_rgba(0,0,0,0.9)]">
          CAM {camNo}
        </div>
      )}

      {/* top-right REC / offline state */}
      <div className="absolute right-1 top-1 flex items-center gap-1 font-mono text-[10px] leading-none">
        {offline ? (
          <span className="text-[#ffd166] drop-shadow-[0_1px_0_rgba(0,0,0,0.9)]">NO&nbsp;SIGNAL</span>
        ) : (
          <>
            <span className="size-1.5 rounded-full bg-[#ff3b3b] pulse-dot" />
            <span className="text-[#ff6b6b] drop-shadow-[0_1px_0_rgba(0,0,0,0.9)]">REC</span>
          </>
        )}
      </div>

      {/* bottom-left running timestamp */}
      {showTimestamp && (
        <div className="absolute bottom-1 left-1 font-mono text-[10px] leading-none text-[#bfe9c9] drop-shadow-[0_1px_0_rgba(0,0,0,0.9)]">
          {insertDate.replaceAll("-", "/")} {clock}
        </div>
      )}

      {/* bottom-right fps */}
      <div className="absolute bottom-1 right-1 font-mono text-[10px] leading-none text-[#8fb59a]/80 drop-shadow-[0_1px_0_rgba(0,0,0,0.9)]">
        {12 + (index % 3) * 3}FPS
      </div>
    </div>
  )
}

/** a believable CCTV "no signal" tile: static noise + drifting sweep */
function NoSignal({ seed }: { seed: number }) {
  return (
    <div className="absolute inset-0 bg-[#0a0d0c]">
      <div
        className="absolute inset-0 opacity-[0.5] mix-blend-screen"
        style={{
          backgroundImage: "radial-gradient(circle, #5a6b60 0.5px, transparent 0.7px)",
          backgroundSize: "3px 3px",
          animation: `cctv-noise 0.${4 + (seed % 5)}s steps(2) infinite`,
        }}
      />
      <div
        className="absolute inset-x-0 h-10 opacity-30"
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(180,220,190,0.18), transparent)",
          animation: "cctv-sweep 4.5s linear infinite",
        }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * a slowly advancing diegetic clock, offset per camera
 * ------------------------------------------------------------------ */

function useCctvClock(offset: number) {
  const [tick, setTick] = React.useState(0)
  React.useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000)
    return () => window.clearInterval(id)
  }, [])
  const total = 84_660 + offset * 7 + tick // ~23:31:00 base, per-cam offset
  const h = Math.floor((total / 3600) % 24)
  const m = Math.floor((total / 60) % 60)
  const s = Math.floor(total % 60)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}