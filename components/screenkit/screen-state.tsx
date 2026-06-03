"use client"

import * as React from "react"
import { Languages } from "lucide-react"
import type { Insert, Locale, PlaybackMode } from "@/lib/screenkit/types"
import { resolveInsert } from "@/lib/screenkit/data"
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  LOCALES,
  LANG_TAG,
  modeLabel,
  translate,
} from "@/lib/screenkit/i18n"
import type { PreviewSettings } from "./store"
import { aspectValue } from "./device-frame"
import { InsertPreview } from "./insert-preview"
import { FloatingMenu, type Orientation } from "./floating-menu"

/** Compute the largest screen box (matching the insert aspect) that fits the
 *  viewport, accounting for a 90° rotation when in portrait orientation. */
function fitBox(
  vw: number,
  vh: number,
  ratio: number,
  orientation: Orientation,
) {
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
  // portrait: element is rotated 90°, so its on-screen footprint is (h, w).
  // fit the footprint (eh wide, ew tall) into the viewport.
  let h = Math.min(vw, vh / ratio) // footprint width == element height
  let w = h * ratio // element width (becomes footprint height)
  if (w > vh) {
    w = vh
    h = w / ratio
  }
  return { w, h }
}

export function ScreenState({ insert }: { insert: Insert }) {
  const [mode, setMode] = React.useState<PlaybackMode>("clean")
  // standalone state: it has no site chrome, so it owns its own language.
  const [siteLocale, setSiteLocale] = React.useState<Locale>(DEFAULT_LOCALE)
  const [override, setOverride] = React.useState<Locale | null>(null)
  const [orientation, setOrientation] = React.useState<Orientation>("landscape")

  // chrome visibility — hidden by default, revealed on pointer/touch activity
  const [chromeVisible, setChromeVisible] = React.useState(false)
  const hideTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const stageRef = React.useRef<HTMLDivElement>(null)
  const [box, setBox] = React.useState({ w: 0, h: 0 })

  const english = typeof insert.title.en === "string"
  const ratio = aspectValue[insert.aspect]

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
      if (stored === "ru" || stored === "en") setSiteLocale(stored)
    } catch {
      // ignore
    }
  }, [])

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

  // reveal chrome on any activity, then auto-hide after a short delay
  const revealChrome = React.useCallback(() => {
    setChromeVisible(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setChromeVisible(false), 2600)
  }, [])

  React.useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [])

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
    `transition-opacity duration-300 ${chromeVisible ? "opacity-100" : "pointer-events-none opacity-0"} ${extra}`

  return (
    <main
      className="fixed inset-0 overflow-hidden bg-black"
      onPointerMove={revealChrome}
      onPointerDown={revealChrome}
    >
      {/* full-bleed measuring stage */}
      <div
        ref={stageRef}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div
          id="screen-stage"
          className="overflow-hidden bg-black transition-transform duration-500"
          style={{
            width: box.w || undefined,
            height: box.h || undefined,
            transform:
              orientation === "portrait" ? "rotate(90deg)" : undefined,
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

      {/* tap-to-reveal hint, shown only while chrome is hidden */}
      <div
        className={`pointer-events-none fixed bottom-5 left-1/2 z-30 -translate-x-1/2 transition-opacity duration-300 ${chromeVisible ? "opacity-0" : "opacity-100"}`}
      >
        <span className="rounded-full bg-black/40 px-3 py-1 font-mono text-[10px] lowercase text-white/40 backdrop-blur-sm">
          {translate(siteLocale, "fm.revealHint")}
        </span>
      </div>

      <FloatingMenu
        locale={siteLocale}
        insertId={insert.id}
        orientation={orientation}
        onOrientationChange={setOrientation}
        className={chromeCls()}
        onInteract={revealChrome}
      />
    </main>
  )
}
