"use client"

import { Grain } from "@screenkit/core/grain"
import type { InsertSceneManifest, SceneProps } from "@screenkit/core"

export const manifest: InsertSceneManifest = {
  key: "cctv",
  label: "CCTV / security camera",
  categories: ["cctv"],
}

export function Scene({ insert }: SceneProps) {
  return (
    <div className="absolute inset-0 bg-[#0b120e] text-[#9fb7a6]">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 30%, rgba(120,160,130,0.18), transparent 60%)",
        }}
      />
      {/* abstract room geometry */}
      <div className="absolute inset-0">
        <div className="absolute left-[8%] top-[55%] h-[40%] w-[24%] -skew-x-12 bg-black/40" />
        <div className="absolute right-[10%] top-[50%] h-[44%] w-[28%] skew-x-12 bg-black/40" />
        <div className="absolute left-1/2 top-[62%] h-2 w-[60%] -translate-x-1/2 bg-black/30" />
        <div className="absolute left-[40%] top-[40%] h-[30%] w-[8%] rounded-t-full bg-black/50" />
      </div>
      <Grain />
      <div className="absolute left-2 top-2 font-mono text-[10px] tracking-wide text-[#cfe3d4]/80">
        CAM {insert.id.slice(-2)} · {insert.scene.toUpperCase()}
      </div>
      <div className="absolute right-2 top-2 font-mono text-[10px] text-[#cfe3d4]/80">
        2025-03-{insert.id.slice(-2)} 23:41:0{insert.id.slice(-1)}
      </div>
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 font-mono text-[10px] text-[#ff6b6b]">
        <span className="size-1.5 rounded-full bg-[#ff6b6b] pulse-dot" /> REC
      </div>
      <div className="absolute bottom-2 right-2 font-mono text-[10px] text-[#cfe3d4]/70">
        {insert.aspect} · 12fps
      </div>
    </div>
  )
}
