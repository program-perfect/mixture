"use client"

import * as React from "react"
import { Phone, PhoneOff, Video, Battery, Radar, Wifi } from "lucide-react"
import type { Insert } from "@/lib/screenkit/types"

/* The "screen content" of a prop insert. Intentionally gritty / diegetic. */

export function InsertCanvas({ insert }: { insert: Insert }) {
  const t = insert.title.toLowerCase()

  if (insert.category === "trackers") return <TrackerScene insert={insert} />
  if (insert.category === "tv-news") return <TvNewsScene insert={insert} />
  if (insert.category === "bank") return <BankScene />
  if (insert.category === "cctv") return <CctvScene insert={insert} />
  if (insert.category === "phones") {
    if (t.includes("messenger") || t.includes("sms")) return <MessengerScene />
    if (t.includes("location") || t.includes("geolocation"))
      return <TrackerScene insert={insert} compact />
    if (t.includes("call")) return <CallScene video={t.includes("video")} insert={insert} />
    if (t.includes("battery") || t.includes("football"))
      return <DyingVideoScene />
    return <CallScene video insert={insert} />
  }
  // hq monitors
  if (t.includes("timer")) return <CountdownScene />
  if (t.includes("text file") || t.includes("karaev")) return <TextFileScene />
  if (t.includes("remote")) return <RemoteScene />
  if (t.includes("wanted")) return <WantedScene />
  return <SituationScene insert={insert} />
}

/* ------------------------------- helpers ------------------------------- */

function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-screen"
      style={{
        backgroundImage:
          "radial-gradient(circle, #fff 0.5px, transparent 0.6px)",
        backgroundSize: "3px 3px",
      }}
    />
  )
}

/* ------------------------------- scenes ------------------------------- */

function CctvScene({ insert }: { insert: Insert }) {
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

function TrackerScene({
  insert,
  compact,
}: {
  insert: Insert
  compact?: boolean
}) {
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

function TvNewsScene({ insert }: { insert: Insert }) {
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

function BankScene() {
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

function CallScene({ video, insert }: { video?: boolean; insert: Insert }) {
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
        <p className="font-mono text-xs text-white/50">+7 ··· ··· {insert.id.slice(-2)} 0{insert.id.slice(-1)}</p>
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

function MessengerScene() {
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

function DyingVideoScene() {
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

function CountdownScene() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black">
      <span
        className="font-mono text-5xl font-bold tracking-widest text-[#ff3b3b] fx-flicker"
        style={{ textShadow: "0 0 18px rgba(255,59,59,0.7)" }}
      >
        00:00
      </span>
    </div>
  )
}

function TextFileScene() {
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

function RemoteScene() {
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

function WantedScene() {
  return (
    <div className="absolute inset-0 grid grid-cols-3 gap-2 bg-[#0c0e12] p-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-1 rounded-md bg-black/40 p-1.5 ring-1 ring-white/5"
        >
          <div className="aspect-square w-full rounded-sm bg-white/10" />
          <span className="font-mono text-[8px] text-white/50">№ 0{i + 1}-2025</span>
          <span className="h-1 w-2/3 rounded-full bg-[#ef476f]/70" />
        </div>
      ))}
    </div>
  )
}

function SituationScene({ insert }: { insert: Insert }) {
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
