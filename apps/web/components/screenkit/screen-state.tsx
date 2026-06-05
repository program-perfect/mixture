"use client"

import { resolveInsert } from "@/lib/screenkit/data"
import {
  DEFAULT_LOCALE,
  LANG_TAG,
  LOCALE_STORAGE_KEY,
  LOCALES,
  modeLabel,
  translate,
} from "@/lib/screenkit/i18n"
import type { Insert, Locale, PlaybackMode } from "@/lib/screenkit/types"
import { Languages } from "lucide-react"
import * as React from "react"
import { aspectValue } from "./device-frame"
import { FloatingMenu, type Orientation, type RevealMode } from "./floating-menu"
import { InsertPreview } from "./insert-preview"
import type { PreviewSettings } from "./store"

const REVEAL_MODE_KEY = "screenkit.reveal-mode"
const REVEAL_HOTKEY = "m" // press to toggle chrome while in hotkey mode

/** Largest box matching the insert aspect that fits the viewport, accounting
 *  for a 90° rotation when portrait. */
function fitBox(vw: number, vh: number, ratio: number, orientation: Orientation) {
  if (vw <= 0 || vh <= 0) return { w: 0, h: 0 }
  if (orientation === "landscape") {
    let w = Math.min(vw, vh * ratio)
    let h = w / ratio
    if (h > vh) {
      h = vh
      w = h * ratio
    }
    return { w, h }
  }
  // portrait: element is rotated 90°, so its footprint is (height, width)
  let h = Math.min(vw, vh / ratio)
  let w = h * ratio
  if (w > vh) {
    w = vh
    h = w / ratio
  }
  return { w, h }
}

export function ScreenState({ insert }: { insert: Insert }) {
  const [mode, setMode] = React.useState<PlaybackMode>("clean")
  // standalone view owns its own language (no site chrome around it)
  const [siteLocale, setSiteLocale] = React.useState<Locale>(DEFAULT_LOCALE)
  const [override, setOverride] = React.useState<Locale | null>(null)
  const [orientation, setOrientation] = React.useState<Orientation>("landscape")

  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [revealMode, setRevealMode] = React.useState<RevealMode>("exit")
  // only used in hotkey mode: whether chrome is toggled on while fullscreen
  const [hotkeyShown, setHotkeyShown] = React.useState(false)

  const stageRef = React.useRef<HTMLDivElement>(null)
  const [box, setBox] = React.useState({ w: 0, h: 0 })

  const english = typeof insert.title.en === "string"
  const ratio = aspectValue[insert.aspect]

  // chrome is hidden while fullscreen unless explicitly revealed
  const chromeVisible =
    !isFullscreen || (revealMode === "hotkey" && hotkeyShown)

  // the reveal hint appears when chrome hides, then fades out after a moment
  const [hintVisible, setHintVisible] = React.useState(false)
  React.useEffect(() => {
    if (chromeVisible) {
      setHintVisible(false)
      return
    }
    setHintVisible(true)
    const t = window.setTimeout(() => setHintVisible(false), 2500)
    return () => window.clearTimeout(t)
  }, [chromeVisible])

  // restore persisted reveal mode + site locale
  React.useEffect(() => {
    try {
      const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)
      if (storedLocale === "ru" || storedLocale === "en")
        setSiteLocale(storedLocale)
      const storedMode = window.localStorage.getItem(REVEAL_MODE_KEY)
      if (storedMode === "exit" || storedMode === "hotkey")
        setRevealMode(storedMode)
    } catch {
      // ignore
    }
  }, [])

  const changeRevealMode = React.useCallback((m: RevealMode) => {
    setRevealMode(m)
    try {
      window.localStorage.setItem(REVEAL_MODE_KEY, m)
    } catch {
      // ignore
    }
  }, [])

  // track fullscreen state
  React.useEffect(() => {
    const onChange = () => {
      const fs = Boolean(document.fullscreenElement)
      setIsFullscreen(fs)
      if (!fs) setHotkeyShown(false)
    }
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])

  const toggleFullscreen = React.useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await document.documentElement.requestFullscreen()
    } catch {
      // fullscreen may be blocked; ignore
    }
  }, [])

  // auto-enter fullscreen — try immediately, then on first user gesture (most
  // browsers require a gesture, so we wire a one-shot fallback).
  React.useEffect(() => {
    let done = false
    const enter = () => {
      if (done || document.fullscreenElement) return
      done = true
      document.documentElement.requestFullscreen?.().catch(() => {})
      window.removeEventListener("pointerdown", enter)
      window.removeEventListener("keydown", enter)
    }
    enter()
    if (!document.fullscreenElement) {
      window.addEventListener("pointerdown", enter, { once: true })
      window.addEventListener("keydown", enter, { once: true })
    }
    return () => {
      window.removeEventListener("pointerdown", enter)
      window.removeEventListener("keydown", enter)
    }
  }, [])

  // hotkey toggles chrome while in hotkey mode
  React.useEffect(() => {
    if (revealMode !== "hotkey") return
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === REVEAL_HOTKEY) {
        setHotkeyShown((s) => !s)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [revealMode])

  // measure the viewport and recompute the screen box
  React.useEffect(() => {
    const measure = () => {
      const el = stageRef.current
      if (!el) return
      setBox(fitBox(el.clientWidth, el.clientHeight, ratio, orientation))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (stageRef.current) ro.observe(stageRef.current)
    window.addEventListener("orientationchange", measure)
    return () => {
      ro.disconnect()
      window.removeEventListener("orientationchange", measure)
    }
  }, [ratio, orientation])

  const wanted = override ?? siteLocale
  const insertLocale: Locale = wanted === "en" && !english ? "ru" : wanted
  const resolved = resolveInsert(insert, insertLocale)

  const settings: PreviewSettings = {
    device: insert.device,
    mode,
    aspect: insert.aspect,
    brightness: 72,
    noise: mode === "clean" ? 0 : mode === "dirty" ? 48 : 32,
    reflections: mode !== "clean",
    scanlines: mode !== "clean",
    timestamp: mode !== "clean",
  }

  const modes: PlaybackMode[] = ["clean", "filmed", "dirty"]

  const chromeCls = (extra = "") =>
    `transition-opacity duration-300 ${
      chromeVisible ? "opacity-100" : "pointer-events-none opacity-0"
    } ${extra}`

  return (
    <main className="fixed inset-0 overflow-hidden bg-black">
      {/* full-bleed measuring stage — no bezel, no rounding */}
      <div ref={stageRef} className="absolute inset-0 flex items-center justify-center">
        <div
          id="screen-stage"
          className="overflow-hidden bg-black transition-transform duration-500"
          style={{
            width: box.w || undefined,
            height: box.h || undefined,
            transform: orientation === "portrait" ? "rotate(90deg)" : undefined,
          }}
        >
          {box.w > 0 ? (
            <InsertPreview insert={resolved} settings={settings} bare />
          ) : null}
        </div>
      </div>

      {/* minimal top controls */}
      <div
        className={chromeCls(
          "fixed left-1/2 top-4 z-40 flex -translate-x-1/2 items-center gap-2",
        )}
      >
        {/* mode switch */}
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/50 p-1 backdrop-blur-md">
          {modes.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={
                "rounded-full px-3 py-1 font-mono text-[11px] lowercase transition-colors " +
                (m === mode
                  ? "bg-white text-black"
                  : "text-white/55 hover:text-white")
              }
            >
              {modeLabel(m, siteLocale)}
            </button>
          ))}
        </div>

        {/* per-insert language switch (independent of the site language) */}
        {english ? (
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/50 p-1 backdrop-blur-md">
            <Languages className="ml-1 size-3.5 text-white/40" aria-hidden />
            {LOCALES.map((l) => (
              <button
                key={l}
                onClick={() => setOverride(l)}
                aria-pressed={l === insertLocale}
                className={
                  "rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide transition-colors " +
                  (l === insertLocale
                    ? "bg-white text-black"
                    : "text-white/55 hover:text-white")
                }
              >
                {LANG_TAG[l]}
              </button>
            ))}
          </div>
        ) : (
          <span
            title={translate(siteLocale, "common.ruOnlyHint")}
            className="flex items-center gap-1.5 rounded-full border border-dashed border-white/25 bg-white/5 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-white/60 backdrop-blur-md"
          >
            <Languages className="size-3.5" />
            {translate(siteLocale, "common.ruOnly")}
          </span>
        )}
      </div>

      {/* reveal hint, shown only while chrome is hidden in fullscreen */}
      <div
        className={`pointer-events-none fixed bottom-5 left-1/2 z-30 -translate-x-1/2 transition-opacity duration-500 ${
          hintVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="rounded-full bg-black/40 px-3 py-1 font-mono text-[10px] lowercase text-white/40 backdrop-blur-sm">
          {translate(
            siteLocale,
            revealMode === "hotkey" ? "fm.revealHintKey" : "fm.revealHintExit",
          )}
        </span>
      </div>

      <FloatingMenu
        locale={siteLocale}
        insertId={insert.id}
        orientation={orientation}
        onOrientationChange={setOrientation}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        revealMode={revealMode}
        onRevealModeChange={changeRevealMode}
        className={chromeCls()}
      />
    </main>
  )
}
