"use client"

import { Wifi } from "lucide-react"
import type { InsertSceneManifest, SceneProps } from "@screenkit/core"

export const manifest: InsertSceneManifest = {
  key: "remote",
  label: "Remote terminal session",
  inserts: ["gs-007"],
}

export function Scene(_: SceneProps) {
  const lines = [
    "$ ssh op@10.14.2.7",
    "connected · latency 312ms",
    "> scanning /home/target",
    "> 4 files matched",
    "> pulling archive…",
    "███████░░░░ 64%",
  ]
  return (
    <div className="absolute inset-0 bg-[#06080a] p-3 font-mono text-[11px] leading-relaxed text-[#7fffb0]">
      <div className="mb-2 flex items-center gap-2 text-white/50">
        <Wifi className="size-3" /> remote session · unstable
      </div>
      {lines.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
    </div>
  )
}
