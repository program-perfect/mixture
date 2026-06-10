"use client"

import type { InsertSceneManifest, SceneProps } from "@screenkit/core"

export const manifest: InsertSceneManifest = {
  key: "countdown",
  label: "Countdown timer",
  inserts: ["gs-002"],
}

export function Scene(_: SceneProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black">
      <span
        className="font-mono text-5xl font-bold tracking-widest text-[#ff3b3b] fx-flicker"
        style={{ textShadow: "0 0 18px rgba(255,59,59,0.7)" }}
      >
        00:00
      </span>
    </div>
  )
}
