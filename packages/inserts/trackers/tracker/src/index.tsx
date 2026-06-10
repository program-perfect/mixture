"use client"

import { Radar } from "lucide-react"
import type { InsertSceneManifest, SceneProps } from "@screenkit/core"

export const manifest: InsertSceneManifest = {
  key: "tracker",
  label: "GPS tracker / map",
  categories: ["trackers"],
  inserts: ["gs-027"],
}

export function Scene({ insert }: SceneProps) {
  // location pings shown inside a phone (gs-027) render in the compact variant
  const compact = insert.category === "phones"
  return (
    <div className="absolute inset-0 bg-[#070a12] text-[#9fb0d0]">
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0H0V28" fill="none" stroke="rgba(108,99,255,0.16)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <polyline
          points="6,82 22,60 38,64 55,40 72,46 90,22"
          fill="none"
          stroke="#6c63ff"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          vectorEffect="non-scaling-stroke"
          transform="scale(3,2.2)"
          opacity="0.7"
        />
      </svg>
      <div className="absolute right-[16%] top-[20%]">
        <span className="block size-3 rounded-full bg-[#ef476f] pulse-dot ring-2 ring-[#ef476f]/40" />
      </div>
      {!compact && (
        <div className="absolute left-3 top-3 flex items-center gap-1.5 font-mono text-[10px] text-[#b9c4ea]">
          <Radar className="size-3" /> tracking · 1 target
        </div>
      )}
      <div className="absolute bottom-3 left-3 font-mono text-[10px] leading-relaxed text-[#8a96c4]">
        <div>lat 41.31182</div>
        <div>lon 69.27968</div>
        <div>spd 38 km/h · hdg 124°</div>
      </div>
      <div className="absolute bottom-3 right-3 font-mono text-[10px] text-[#ef476f]">
        last seen 00:0{insert.id.slice(-1)}
      </div>
    </div>
  )
}
