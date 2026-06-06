"use client"

import type { InsertSceneManifest, SceneProps } from "@screenkit/core"

export const manifest: InsertSceneManifest = {
  key: "bank",
  label: "Banking transfer",
  categories: ["bank"],
}

export function Scene(_: SceneProps) {
  return (
    <div className="absolute inset-0 flex flex-col bg-[#0d1014] text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="font-mono text-xs lowercase text-white/60">
          internet bank
        </span>
        <span className="size-5 rounded-full bg-[#22c55e]/20 ring-1 ring-[#22c55e]/50" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6">
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
          перевод
        </span>
        <span className="font-mono text-3xl font-bold text-white">
          ₽ 4 850 000
        </span>
        <span className="font-mono text-[11px] text-white/50">
          счёт •••• •••• •••• 7314
        </span>
        <div className="mt-3 rounded-full bg-[#22c55e] px-5 py-2 font-mono text-xs font-bold lowercase text-black">
          подтвердить
        </div>
      </div>
    </div>
  )
}
