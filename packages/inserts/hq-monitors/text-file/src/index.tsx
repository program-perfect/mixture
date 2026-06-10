"use client"

import type { InsertSceneManifest, SceneProps } from "@screenkit/core"

export const manifest: InsertSceneManifest = {
  key: "text-file",
  label: "Text file / ledger",
  inserts: ["gs-024"],
}

export function Scene(_: SceneProps) {
  const lines = [
    "karaev.txt",
    "—————————————",
    "08.02  никольский   ₽ 1 200 000",
    "11.02  бондарев     ₽   850 000",
    "14.02  шигорев      встреча 18:00",
    "20.02  склад «гэс»  координаты ↑",
    "25.02  не выходить на связь",
  ]
  return (
    <div className="absolute inset-0 bg-[#0b0d11] p-3 font-mono text-[11px] leading-relaxed">
      {lines.map((l, i) => (
        <div
          key={i}
          className={i >= 2 && i <= 3 ? "bg-[#ff9f1c]/15 text-[#ffd9a0]" : "text-[#9fb0c8]"}
        >
          <span className="mr-2 text-white/25">{String(i + 1).padStart(2, "0")}</span>
          {l}
        </div>
      ))}
    </div>
  )
}
