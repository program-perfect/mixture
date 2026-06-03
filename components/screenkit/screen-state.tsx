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
import { InsertPreview } from "./insert-preview"
import { FloatingMenu } from "./floating-menu"

export function ScreenState({ insert }: { insert: Insert }) {
  const [mode, setMode] = React.useState<PlaybackMode>("filmed")
  // standalone state: it has no site chrome, so it owns its own language.
  // it starts from the persisted site language, then can be overridden
  // locally for this insert only — never writing back to the site setting.
  const [siteLocale, setSiteLocale] = React.useState<Locale>(DEFAULT_LOCALE)
  const [override, setOverride] = React.useState<Locale | null>(null)

  const english = typeof insert.title.en === "string"

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
      if (stored === "ru" || stored === "en") setSiteLocale(stored)
    } catch {
      // ignore
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
    noise: mode === "dirty" ? 48 : 32,
    reflections: true,
    scanlines: true,
    timestamp: true,
  }

  const modes: PlaybackMode[] = ["clean", "filmed", "dirty"]

  return (
    <main className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-black">
      {/* the rotating stage */}
      <div
        id="screen-stage"
        data-orientation="landscape"
        className="flex h-full w-full items-center justify-center p-6 transition-transform duration-500 data-[orientation=portrait]:rotate-90 sm:p-10"
      >
        <InsertPreview
          insert={resolved}
          settings={settings}
          className="max-h-full max-w-full"
        />
      </div>

      {/* minimal top controls, fade unless hovered */}
      <div className="group fixed left-1/2 top-4 z-40 flex -translate-x-1/2 items-center gap-2">
        {/* mode switch */}
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/40 p-1 opacity-30 backdrop-blur-md transition-opacity group-hover:opacity-100">
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
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/40 p-1 opacity-30 backdrop-blur-md transition-opacity group-hover:opacity-100">
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
            className="flex items-center gap-1.5 rounded-full border border-dashed border-white/25 bg-white/5 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-white/60 opacity-30 backdrop-blur-md transition-opacity group-hover:opacity-100"
          >
            <Languages className="size-3.5" />
            {translate(siteLocale, "common.ruOnly")}
          </span>
        )}
      </div>

      <FloatingMenu locale={siteLocale} />
    </main>
  )
}
