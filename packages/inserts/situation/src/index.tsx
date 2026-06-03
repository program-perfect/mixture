"use client"

import type { InsertSceneManifest, SceneProps } from "@screenkit/core"

/* the catch-all "operational HQ situation board" used whenever no other scene
   claims the insert (e.g. generic hq-monitors inserts). */
export const manifest: InsertSceneManifest = {
  key: "situation",
  label: "Situation board (default)",
  fallback: true,
}

export function Scene({ insert }: SceneProps) {
  return (
    <div className="absolute inset-0 bg-[#080b10] p-3 text-[#9fb0c8]">
      <div className="mb-2 flex items-center justify-between font-mono text-[10px] text-white/60">
        <span>оперативный штаб</span>
        <span>{insert.episode.toUpperCase()}</span>
      </div>
      <div className="grid h-[78%] grid-cols-3 gap-2">
        <div className="col-span-2 rounded-md bg-black/40 ring-1 ring-white/5">
          <svg className="h-full w-full" preserveAspectRatio="none">
            <defs>
              <pattern id="g2" width="22" height="22" patternUnits="userSpaceOnUse">
                <path d="M22 0H0V22" fill="none" stroke="rgba(76,201,240,0.18)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#g2)" />
            <circle cx="46%" cy="44%" r="5" fill="#4cc9f0" />
            <circle cx="70%" cy="62%" r="5" fill="#ef476f" />
          </svg>
        </div>
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="size-6 rounded-sm bg-white/10" />
              <span className="h-1.5 flex-1 rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 overflow-hidden">
        <div className="whitespace-nowrap font-mono text-[9px] text-white/40">
          • объект перемещается • запрос на ордер • камеры 4,7,9 активны •
        </div>
      </div>
    </div>
  )
}
