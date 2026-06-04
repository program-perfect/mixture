"use client"

import type { InsertSceneManifest, SceneProps } from "@screenkit/core"

export const manifest: InsertSceneManifest = {
  key: "wanted",
  label: "Wanted board",
  inserts: ["gs-012"],
}

export function Scene(_: SceneProps) {
  return (
    <div className="absolute inset-0 grid grid-cols-3 gap-2 bg-[#0c0e12] p-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-1 rounded-md bg-black/40 p-1.5 ring-1 ring-white/5"
        >
          <div className="aspect-square w-full rounded-sm bg-white/10" />
          <span className="font-mono text-[8px] text-white/50">№ 0{i + 1}-2026</span>
          <span className="h-1 w-2/3 rounded-full bg-[#ef476f]/70" />
        </div>
      ))}
    </div>
  )
}
