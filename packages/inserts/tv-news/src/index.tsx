"use client"

import type { InsertSceneManifest, SceneProps } from "@screenkit/core"

export const manifest: InsertSceneManifest = {
  key: "tv-news",
  label: "TV news broadcast",
  categories: ["tv-news"],
}

export function Scene({ insert }: SceneProps) {
  return (
    <div className="absolute inset-0 bg-[#10131a] text-white">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(40,52,80,0.5), rgba(8,10,16,0.9))",
        }}
      />
      <div className="absolute left-[12%] top-[18%] h-[44%] w-[40%] rounded-md bg-black/40 ring-1 ring-white/10" />
      <div className="absolute right-[10%] top-[22%] h-[36%] w-[30%] rounded-md bg-black/30 ring-1 ring-white/10" />
      <div className="absolute right-3 top-3 rounded bg-white/10 px-2 py-1 font-mono text-[10px] tracking-widest text-white/80">
        НТ-7
      </div>
      <div className="absolute bottom-9 left-0 right-0">
        <div className="mx-3 flex items-stretch overflow-hidden rounded-sm">
          <span className="bg-[#d92d3c] px-2 py-1.5 font-mono text-[11px] font-bold uppercase">
            срочно
          </span>
          <span className="flex-1 bg-black/70 px-2 py-1.5 font-mono text-[11px] text-white/90">
            следствие по делу «{insert.episode}» · оперативный штаб
          </span>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden bg-black/80 py-1">
        <div className="whitespace-nowrap font-mono text-[10px] text-white/70">
          • розыск продолжается • камеры зафиксировали движение • штаб усилен •
          граница под наблюдением •
        </div>
      </div>
    </div>
  )
}
