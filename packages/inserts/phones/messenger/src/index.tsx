"use client"

import type { InsertSceneManifest, SceneProps } from "@screenkit/core"
import * as React from "react"

export const manifest: InsertSceneManifest = {
  key: "messenger",
  label: "Android-style messenger with video attachments",
  inserts: ["gs-009"],
}

type Theme = "dark" | "light"
type VideoFormat = "mixed" | "vertical" | "horizontal" | "square"

type MessengerSettings = {
  messengerTheme?: Theme
  messengerMotion?: boolean
  messengerDelay?: number
  messengerVideoFormat?: VideoFormat
  messengerHiddenNumber?: boolean
}

type VideoItem = {
  id: string
  title: string
  meta: string
  duration: string
  format: Exclude<VideoFormat, "mixed">
}

const BASE_VIDEOS: VideoItem[] = [
  {
    id: "vid-vertical",
    title: "VID_20260604_2218.mp4",
    meta: "9:16 · 18,4 мб",
    duration: "0:17",
    format: "vertical",
  },
  {
    id: "vid-wide",
    title: "CAM_02_fragment.mp4",
    meta: "16:9 · 42,1 мб",
    duration: "1:08",
    format: "horizontal",
  },
  {
    id: "vid-square",
    title: "clip_объект_03.mov",
    meta: "1:1 · 12,7 мб",
    duration: "0:31",
    format: "square",
  },
]

function readSettings(settings: SceneProps["settings"]): Required<MessengerSettings> {
  const raw = (settings ?? {}) as MessengerSettings
  return {
    messengerTheme: raw.messengerTheme === "light" ? "light" : "dark",
    messengerMotion: raw.messengerMotion === true,
    messengerDelay:
      typeof raw.messengerDelay === "number" && Number.isFinite(raw.messengerDelay)
        ? Math.min(12, Math.max(0, raw.messengerDelay))
        : 4,
    messengerVideoFormat:
      raw.messengerVideoFormat === "vertical" ||
      raw.messengerVideoFormat === "horizontal" ||
      raw.messengerVideoFormat === "square"
        ? raw.messengerVideoFormat
        : "mixed",
    messengerHiddenNumber: raw.messengerHiddenNumber !== false,
  }
}

export function Scene({ settings }: SceneProps) {
  const config = readSettings(settings)
  const [ready, setReady] = React.useState(config.messengerDelay === 0)
  const [activeVideo, setActiveVideo] = React.useState<VideoItem | null>(null)
  const [composer, setComposer] = React.useState("")
  const [muted, setMuted] = React.useState(false)
  const [progress, setProgress] = React.useState(28)

  const videos = React.useMemo(() => {
    if (config.messengerVideoFormat === "mixed") return BASE_VIDEOS
    return BASE_VIDEOS.map((video) => ({
      ...video,
      format: config.messengerVideoFormat as Exclude<VideoFormat, "mixed">,
      meta:
        config.messengerVideoFormat === "vertical"
          ? "9:16 · 18,4 мб"
          : config.messengerVideoFormat === "horizontal"
            ? "16:9 · 42,1 мб"
            : "1:1 · 12,7 мб",
    }))
  }, [config.messengerVideoFormat])

  React.useEffect(() => {
    setReady(config.messengerDelay === 0)
    if (config.messengerDelay === 0) return
    const timer = window.setTimeout(
      () => setReady(true),
      config.messengerDelay * 1000,
    )
    return () => window.clearTimeout(timer)
  }, [config.messengerDelay])

  React.useEffect(() => {
    if (!activeVideo) return
    const timer = window.setInterval(() => {
      setProgress((value) => (value >= 86 ? 18 : value + 1))
    }, 700)
    return () => window.clearInterval(timer)
  }, [activeVideo])

  const dark = config.messengerTheme === "dark"
  const colors = dark
    ? {
        shell: "#17212b",
        list: "#0f1820",
        header: "#202b36",
        text: "#f2f7fb",
        muted: "#8da0ae",
        inBubble: "#222e3a",
        outBubble: "#2b5278",
        field: "#202b36",
        line: "rgba(255,255,255,0.08)",
        player: "#05080d",
      }
    : {
        shell: "#ffffff",
        list: "#e7eef4",
        header: "#548ec4",
        text: "#111820",
        muted: "#64798a",
        inBubble: "#ffffff",
        outBubble: "#d8f5c8",
        field: "#ffffff",
        line: "rgba(0,0,0,0.08)",
        player: "#05080d",
      }

  const animated = config.messengerMotion
  const sender = config.messengerHiddenNumber ? "+7 *** ***‑**‑91" : "+7 981 406‑32‑91"

  return (
    <div
      className="absolute inset-0 overflow-hidden font-sans"
      style={{
        background: colors.shell,
        color: colors.text,
      }}
    >
      <div className="absolute inset-0 flex flex-col">
        <div
          className="flex h-[7.5%] min-h-10 items-center gap-2 px-3"
          style={{
            background: colors.header,
            color: dark ? "#f4f8fb" : "#fff",
            boxShadow: `0 1px 0 ${colors.line}`,
          }}
        >
          <button className="flex size-8 items-center justify-center rounded-full text-[20px] leading-none opacity-90">
            ‹
          </button>
          <div className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#65a8df] to-[#3776ad] text-[13px] font-semibold text-white">
            ?
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[#202b36] bg-[#42c768]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-semibold leading-tight">Неизвестный</div>
            <div className="truncate text-[11px] opacity-75">был(а) недавно · {sender}</div>
          </div>
          <button className="flex size-8 items-center justify-center rounded-full text-[17px] opacity-80">⌕</button>
          <button className="flex size-8 items-center justify-center rounded-full text-[18px] opacity-80">⋮</button>
        </div>

        <div
          className="relative flex-1 overflow-hidden"
          style={{
            background: dark
              ? "radial-gradient(circle at 35% 10%, rgba(69,107,137,.22), transparent 30%), #0e1621"
              : "radial-gradient(circle at 30% 12%, rgba(91,149,196,.20), transparent 28%), #d9e5ee",
          }}
        >
          <Pattern dark={dark} />

          <div className="absolute inset-x-0 top-2 flex justify-center">
            <span
              className="rounded-full px-3 py-1 text-[11px] font-medium"
              style={{
                background: dark ? "rgba(46,64,79,.84)" : "rgba(255,255,255,.82)",
                color: colors.muted,
              }}
            >
              сегодня
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 top-9 flex flex-col justify-end gap-1.5 px-2 pb-2">
            <Bubble colors={colors} out animated={animated} delay={0}>
              Ты кто? Откуда у тебя мой номер?
            </Bubble>
            <Bubble colors={colors} animated={animated} delay={80}>
              Не важно.
            </Bubble>
            <Bubble colors={colors} animated={animated} delay={140}>
              Смотри внимательно. Это снято сегодня.
            </Bubble>

            {!ready && (
              <Typing colors={colors} animated={animated} seconds={config.messengerDelay} />
            )}

            {ready && (
              <div className="flex flex-col gap-1.5">
                <Bubble colors={colors} animated={animated} delay={0}>
                  Видео не пересылай. Просто открой.
                </Bubble>
                {videos.map((video, index) => (
                  <VideoBubble
                    key={video.id}
                    video={video}
                    colors={colors}
                    animated={animated}
                    delay={110 + index * 120}
                    onOpen={() => {
                      setActiveVideo(video)
                      setProgress(28 + index * 9)
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          className="flex min-h-12 items-end gap-2 px-2 py-2"
          style={{ background: colors.list }}
        >
          <div
            className="flex min-h-10 flex-1 items-center gap-2 rounded-[22px] px-3"
            style={{ background: colors.field, boxShadow: `0 0 0 1px ${colors.line}` }}
          >
            <span style={{ color: colors.muted }}>☻</span>
            <input
              value={composer}
              onChange={(event) => setComposer(event.target.value)}
              placeholder="сообщение"
              className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:opacity-70"
              style={{ color: colors.text }}
            />
            <span style={{ color: colors.muted }}>⌕</span>
            <span style={{ color: colors.muted }}>⌘</span>
          </div>
          <button
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-[18px] text-white"
            style={{ background: dark ? "#5288c1" : "#4f9ad8" }}
          >
            {composer ? "➤" : "🎙"}
          </button>
        </div>
      </div>

      {activeVideo && (
        <VideoPlayer
          video={activeVideo}
          colors={colors}
          progress={progress}
          muted={muted}
          animated={animated}
          onMutedChange={setMuted}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </div>
  )
}

function Bubble({
  children,
  colors,
  out,
  animated,
  delay,
}: {
  children: React.ReactNode
  colors: ReturnType<typeof colorType>
  out?: boolean
  animated: boolean
  delay: number
}) {
  return (
    <div
      className="max-w-[82%] rounded-[18px] px-3 py-2 text-[13px] leading-snug shadow-sm"
      style={{
        alignSelf: out ? "flex-end" : "flex-start",
        background: out ? colors.outBubble : colors.inBubble,
        color: colors.text,
        borderBottomRightRadius: out ? 5 : 18,
        borderBottomLeftRadius: out ? 18 : 5,
        animation: animated ? `msgIn 260ms ease ${delay}ms both` : undefined,
      }}
    >
      <span>{children}</span>
      <span className="ml-2 align-baseline text-[10px]" style={{ color: colors.muted }}>
        22:{out ? "14" : "15"}
      </span>
    </div>
  )
}

function VideoBubble({
  video,
  colors,
  animated,
  delay,
  onOpen,
}: {
  video: VideoItem
  colors: ReturnType<typeof colorType>
  animated: boolean
  delay: number
  onOpen: () => void
}) {
  const dims = video.format === "horizontal" ? "16 / 9" : video.format === "square" ? "1 / 1" : "9 / 14"

  return (
    <button
      type="button"
      onClick={onOpen}
      className="max-w-[78%] overflow-hidden rounded-[18px] text-left shadow-md"
      style={{
        alignSelf: "flex-start",
        background: colors.inBubble,
        color: colors.text,
        borderBottomLeftRadius: 5,
        animation: animated ? `msgIn 300ms ease ${delay}ms both` : undefined,
      }}
    >
      <div
        className="relative m-1 overflow-hidden rounded-[14px]"
        style={{ aspectRatio: dims, width: video.format === "horizontal" ? 224 : video.format === "square" ? 174 : 142 }}
      >
        <VideoPoster video={video} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-black/45 text-[22px] text-white backdrop-blur-sm">▶</span>
        </div>
        <span className="absolute bottom-2 right-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white">
          {video.duration}
        </span>
      </div>
      <div className="px-3 pb-2 pt-1">
        <div className="truncate text-[12px] font-medium">{video.title}</div>
        <div className="mt-0.5 text-[10px]" style={{ color: colors.muted }}>{video.meta}</div>
      </div>
    </button>
  )
}

function Typing({ colors, animated, seconds }: { colors: ReturnType<typeof colorType>; animated: boolean; seconds: number }) {
  return (
    <div
      className="max-w-[62%] rounded-[18px] px-3 py-2 text-[12px] shadow-sm"
      style={{
        alignSelf: "flex-start",
        background: colors.inBubble,
        color: colors.muted,
        borderBottomLeftRadius: 5,
        animation: animated ? "msgIn 220ms ease both" : undefined,
      }}
    >
      неизвестный отправит через {seconds} сек. <span className="inline-flex w-7 justify-between align-middle"><i>•</i><i>•</i><i>•</i></span>
    </div>
  )
}

function VideoPlayer({
  video,
  colors,
  progress,
  muted,
  animated,
  onMutedChange,
  onClose,
}: {
  video: VideoItem
  colors: ReturnType<typeof colorType>
  progress: number
  muted: boolean
  animated: boolean
  onMutedChange: (value: boolean) => void
  onClose: () => void
}) {
  const aspect = video.format === "horizontal" ? "16 / 9" : video.format === "square" ? "1 / 1" : "9 / 16"

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col bg-black text-white"
      style={{ animation: animated ? "playerIn 260ms ease both" : undefined }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,.16),transparent_40%)]" />
      <div className="relative z-10 flex h-12 items-center gap-2 bg-gradient-to-b from-black/70 to-transparent px-2">
        <button onClick={onClose} className="flex size-9 items-center justify-center rounded-full text-[24px]">‹</button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-medium">{video.title}</div>
          <div className="text-[11px] text-white/65">получено от неизвестного</div>
        </div>
        <button className="flex size-9 items-center justify-center rounded-full text-[18px]">↗</button>
        <button className="flex size-9 items-center justify-center rounded-full text-[18px]">⋮</button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-3">
        <div className="relative max-h-[78%] w-full max-w-[92%] overflow-hidden rounded-[18px] bg-black shadow-2xl" style={{ aspectRatio: aspect }}>
          <VideoPoster video={video} fill />
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-black/45 text-[30px] backdrop-blur-md">▶</span>
          </div>
          <video aria-label={video.title} className="hidden" muted={muted} playsInline />
        </div>
      </div>

      <div className="relative z-10 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-8">
        <div className="flex items-center gap-3 text-[11px] text-white/70">
          <span>0:{String(Math.floor(progress / 3)).padStart(2, "0")}</span>
          <div className="relative h-1 flex-1 rounded-full bg-white/25">
            <div className="absolute left-0 top-0 h-1 rounded-full bg-white" style={{ width: `${progress}%` }} />
            <div className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full bg-white" style={{ left: `calc(${progress}% - 6px)` }} />
          </div>
          <span>{video.duration}</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-[12px] text-white/80">
          <button onClick={() => onMutedChange(!muted)} className="rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">
            {muted ? "звук выкл." : "звук вкл."}
          </button>
          <button className="rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">скорость 1×</button>
          <button className="rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">сохранить</button>
        </div>
      </div>
      <Keyframes />
    </div>
  )
}

function VideoPoster({ video, fill }: { video: VideoItem; fill?: boolean }) {
  const stripes =
    video.format === "horizontal"
      ? "linear-gradient(135deg, #151d27, #49627a 45%, #0d1017), repeating-linear-gradient(90deg, rgba(255,255,255,.12) 0 1px, transparent 1px 26px)"
      : video.format === "square"
        ? "radial-gradient(circle at 60% 35%, #8c7656, transparent 18%), linear-gradient(135deg, #171923, #394251 48%, #101318)"
        : "linear-gradient(160deg, #07090f, #28364a 42%, #6c7e8c 48%, #10131a)"

  return (
    <div
      className={fill ? "absolute inset-0" : "absolute inset-0"}
      style={{
        backgroundImage: stripes,
        backgroundBlendMode: "screen, normal",
      }}
    >
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle, #fff 0.7px, transparent 1px)", backgroundSize: "5px 5px" }} />
      <div className="absolute bottom-3 left-3 right-3 h-1/3 rounded-xl bg-black/20 blur-sm" />
    </div>
  )
}

function Pattern({ dark }: { dark: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-20"
      style={{
        backgroundImage: `radial-gradient(circle at 12px 12px, ${dark ? "rgba(255,255,255,.12)" : "rgba(70,102,124,.22)"} 1px, transparent 1.2px)`,
        backgroundSize: "26px 26px",
      }}
    />
  )
}

function Keyframes() {
  return (
    <style>{`
      @keyframes msgIn {
        from { opacity: 0; transform: translateY(8px) scale(.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes playerIn {
        from { opacity: 0; transform: scale(.985); }
        to { opacity: 1; transform: scale(1); }
      }
    `}</style>
  )
}

function colorType() {
  return {
    shell: "",
    list: "",
    header: "",
    text: "",
    muted: "",
    inBubble: "",
    outBubble: "",
    field: "",
    line: "",
    player: "",
  }
}
