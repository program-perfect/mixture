"use client"

import * as React from "react"
import type { Insert, PlaybackMode } from "@/lib/screenkit/types"
import type { PreviewSettings } from "./store"
import { InsertPreview } from "./insert-preview"
import { FloatingMenu } from "./floating-menu"

export function ScreenState({ insert }: { insert: Insert }) {
  const [mode, setMode] = React.useState<PlaybackMode>("filmed")

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
          insert={insert}
          settings={settings}
          className="max-h-full max-w-full"
        />
      </div>

      {/* minimal mode switch, top-center, fades unless hovered */}
      <div className="group fixed left-1/2 top-4 z-40 -translate-x-1/2">
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/40 p-1 opacity-30 backdrop-blur-md transition-opacity hover:opacity-100">
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
              {m}
            </button>
          ))}
        </div>
      </div>

      <FloatingMenu />
    </main>
  )
}
