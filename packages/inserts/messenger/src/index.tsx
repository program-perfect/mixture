"use client"

import type { InsertSceneManifest, SceneProps } from "@screenkit/core"

export const manifest: InsertSceneManifest = {
  key: "messenger",
  label: "Messenger chat",
  inserts: ["gs-009"],
}

export function Scene(_: SceneProps) {
  const msgs = [
    { me: false, t: "ты где" },
    { me: true, t: "почти на месте" },
    { me: false, t: "у тебя один час" },
    { me: false, t: "не звони больше" },
  ]
  return (
    <div className="absolute inset-0 flex flex-col bg-[#0b0d11] text-white">
      <div className="border-b border-white/10 px-4 py-3 font-mono text-xs text-white/70">
        контакт ████
      </div>
      <div className="flex flex-1 flex-col justify-end gap-2 p-3">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`max-w-[78%] rounded-2xl px-3 py-2 font-mono text-[11px] ${
              m.me
                ? "self-end bg-[#2f80ed] text-white"
                : "self-start bg-white/10 text-white/90"
            }`}
          >
            {m.t}
          </div>
        ))}
        <div className="self-start font-mono text-[10px] text-white/40">
          печатает…
        </div>
      </div>
    </div>
  )
}
