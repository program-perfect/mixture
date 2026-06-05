"use client"

import type { ResolvedInsert } from "@/lib/screenkit/types"
import { cn } from "@/lib/utils"
import { DeviceFrame } from "./device-frame"
import { InsertCanvas } from "./insert-canvas"
import type { PreviewSettings } from "./store"

export function InsertPreview({
  insert,
  settings,
  className,
  bare,
}: {
  insert: ResolvedInsert
  settings: PreviewSettings
  className?: string
  /** when true, render the raw screen with no device bezel and no rounding */
  bare?: boolean
}) {
  const { mode, brightness, noise, reflections, scanlines, timestamp } = settings

  const brightnessFactor = 0.45 + (brightness / 100) * 0.95
  const filter =
    mode === "dirty"
      ? `brightness(${brightnessFactor}) contrast(1.18) saturate(0.82)`
      : mode === "filmed"
        ? `brightness(${brightnessFactor + 0.05}) contrast(1.05) saturate(0.95)`
        : `brightness(${brightnessFactor}) contrast(1.02)`

  const blur = mode === "filmed" ? "blur(0.4px)" : mode === "dirty" ? "blur(0.2px)" : "none"

  const layers = (
    <>
      {/* base scene with color/brightness grade */}
      <div
        className={cn(
          "absolute inset-0",
          mode === "dirty" && "fx-glitch",
        )}
        style={{ filter: `${filter} ${blur !== "none" ? blur : ""}`.trim() }}
      >
        <InsertCanvas insert={insert} settings={settings} />
      </div>

      {/* moire (filmed) */}
      {mode === "filmed" && <div className="pointer-events-none absolute inset-0 fx-moire" />}

      {/* scanlines */}
      {(scanlines || mode === "dirty") && (
        <div className="pointer-events-none absolute inset-0 fx-scanlines" />
      )}

      {/* reflections / screen glare (filmed) */}
      {reflections && mode !== "clean" && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 28%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.07) 100%)",
          }}
        />
      )}

      {/* white bloom (filmed) */}
      {mode === "filmed" && <div className="pointer-events-none absolute inset-0 fx-bloom" />}

      {/* compression / dropped frame bars (dirty) */}
      {mode === "dirty" && (
        <>
          <div className="pointer-events-none absolute inset-0 fx-vignette" />
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-[38%] h-3 bg-white/5 mix-blend-overlay"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(255,0,80,0.4), rgba(0,200,255,0.4))",
              backgroundSize: "6px 100%",
            }}
          />
        </>
      )}

      {/* sensor noise */}
      {noise > 0 && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-screen"
          style={{
            opacity: (noise / 100) * (mode === "dirty" ? 0.5 : 0.32),
            backgroundImage:
              "radial-gradient(circle, #fff 0.5px, transparent 0.6px)",
            backgroundSize: "2px 2px",
          }}
        />
      )}

      {/* timestamp overlay */}
      {timestamp && (
        <div className="pointer-events-none absolute right-2 top-2 z-10 font-mono text-[10px] text-white/85 drop-shadow">
          {insert.date.replaceAll("-", ".")} 23:4{insert.id.slice(-1)}:0{insert.id.slice(-1)}
        </div>
      )}
    </>
  )

  // bare = raw screen, no bezel, no rounding (used by the fullscreen viewer)
  if (bare) {
    return (
      <div
        className={cn("relative h-full w-full overflow-hidden bg-black", className)}
      >
        {layers}
      </div>
    )
  }

  return (
    <DeviceFrame device={settings.device} aspect={settings.aspect} className={className}>
      {layers}
    </DeviceFrame>
  )
}
