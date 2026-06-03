"use client"

import { Phone, PhoneOff, Video } from "lucide-react"
import type { InsertSceneManifest, SceneProps } from "@screenkit/core"

/* incoming phone call. Default scene for the `phones` category; specific phone
   inserts (messenger, tracker, dying-video) claim their own ids and win first. */
export const manifest: InsertSceneManifest = {
  key: "call",
  label: "Incoming call",
  categories: ["phones"],
}

const AUDIO_CALL_IDS = new Set(["gs-008"])

export function Scene({ insert }: SceneProps) {
  const video = !AUDIO_CALL_IDS.has(insert.id)
  return (
    <div className="absolute inset-0 flex flex-col bg-[#0a0c10] text-white">
      {video ? (
        <div
          className="flex-1"
          style={{
            background:
              "linear-gradient(160deg, rgba(76,201,240,0.25), rgba(34,40,52,0.95))",
          }}
        />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <span className="size-20 rounded-full bg-white/10 ring-1 ring-white/15" />
        </div>
      )}
      <div className="absolute left-0 right-0 top-10 text-center">
        <p className="font-mono text-base text-white">неизвестный</p>
        <p className="font-mono text-xs text-white/50">
          +7 ··· ··· {insert.id.slice(-2)} 0{insert.id.slice(-1)}
        </p>
        <p className="mt-1 font-mono text-[11px] text-[#4cc9f0]">
          {video ? "видеозвонок · 00:1" + insert.id.slice(-1) : "входящий вызов"}
        </p>
      </div>
      <div className="flex items-center justify-center gap-12 pb-8">
        <span className="flex size-12 items-center justify-center rounded-full bg-[#ef476f]">
          <PhoneOff className="size-5" />
        </span>
        <span className="flex size-12 items-center justify-center rounded-full bg-[#22c55e]">
          {video ? <Video className="size-5" /> : <Phone className="size-5" />}
        </span>
      </div>
    </div>
  )
}
