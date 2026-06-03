"use client"

import { Battery } from "lucide-react"
import type { InsertSceneManifest, SceneProps } from "@screenkit/core"

export const manifest: InsertSceneManifest = {
  key: "dying-video",
  label: "Dying phone video",
  inserts: ["gs-023"],
}

export function Scene(_: SceneProps) {
  return (
    <div className="absolute inset-0 flex flex-col bg-[#060708] text-white">
      <div className="flex items-center justify-between px-3 py-2 font-mono text-[10px] text-white/60">
        <span>21:48</span>
        <span className="flex items-center gap-1 text-[#ef476f]">
          1% <Battery className="size-3 rotate-90" />
        </span>
      </div>
      <div
        className="flex-1"
        style={{
          background:
            "linear-gradient(180deg, rgba(34,80,40,0.5), rgba(10,14,10,0.95))",
          filter: "brightness(0.55)",
        }}
      />
      <div className="absolute bottom-3 left-3 right-3">
        <div className="h-1 w-full rounded-full bg-white/15">
          <div className="h-1 w-1/3 rounded-full bg-white/60" />
        </div>
      </div>
    </div>
  )
}
