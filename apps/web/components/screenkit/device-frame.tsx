"use client"

import type { AspectRatio, DeviceType } from "@/lib/screenkit/types"
import { cn } from "@/lib/utils"
import * as React from "react"

export const aspectValue: Record<AspectRatio, number> = {
  "9:16": 9 / 16,
  "16:9": 16 / 9,
  "4:3": 4 / 3,
  "16:10": 16 / 10,
}

/**
 * DeviceFrame renders a physical bezel around the screen content.
 * The screen itself is the `children` and fills the inner area.
 */
export function DeviceFrame({
  device,
  aspect,
  children,
  className,
}: {
  device: DeviceType
  aspect: AspectRatio
  children: React.ReactNode
  className?: string
}) {
  const ratio = aspectValue[aspect]

  const screen = (
    <div
      className="sk-resize relative w-full overflow-hidden"
      style={{ aspectRatio: ratio }}
    >
      {children}
    </div>
  )

  if (device === "phone") {
    return (
      <div className={cn("sk-resize mx-auto w-full max-w-[300px]", className)}>
        <div className="rounded-[2.2rem] border border-panel-border bg-[#0a0a0b] p-2 shadow-[0_0_0_1px_rgba(0,0,0,0.6),0_20px_60px_-20px_rgba(0,0,0,0.9)]">
          <div className="relative overflow-hidden rounded-[1.6rem] bg-black">
            <div className="absolute left-1/2 top-2 z-20 h-1.5 w-16 -translate-x-1/2 rounded-full bg-black/80 ring-1 ring-white/10" />
            {screen}
          </div>
        </div>
      </div>
    )
  }

  if (device === "tablet") {
    return (
      <div className={cn("sk-resize mx-auto w-full max-w-[640px]", className)}>
        <div className="rounded-[1.4rem] border border-panel-border bg-[#0a0a0b] p-3 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)]">
          <div className="overflow-hidden rounded-[0.9rem] bg-black">{screen}</div>
        </div>
      </div>
    )
  }

  if (device === "tv") {
    return (
      <div className={cn("sk-resize mx-auto w-full max-w-[820px]", className)}>
        <div className="rounded-2xl border border-panel-border bg-[#070708] p-3 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.95)]">
          <div className="overflow-hidden rounded-lg bg-black ring-1 ring-white/5">
            {screen}
          </div>
        </div>
        <div className="mx-auto mt-2 h-1.5 w-24 rounded-full bg-[#161617]" />
      </div>
    )
  }

  if (device === "projector") {
    return (
      <div className={cn("sk-resize mx-auto w-full max-w-[820px]", className)}>
        <div className="rounded-md border border-panel-border bg-[#0c0c0d] p-2">
          <div
            className="overflow-hidden rounded-sm bg-black ring-1 ring-white/5"
            style={{ transform: "perspective(1400px) rotateX(1.4deg)" }}
          >
            {screen}
          </div>
        </div>
      </div>
    )
  }

  if (device === "cctv") {
    return (
      <div className={cn("sk-resize mx-auto w-full max-w-[640px]", className)}>
        <div className="rounded-lg border border-panel-border bg-[#0a0a0b] p-2.5">
          <div className="overflow-hidden rounded-sm bg-black ring-1 ring-white/5">
            {screen}
          </div>
        </div>
      </div>
    )
  }

  // monitor (default)
  return (
    <div className={cn("sk-resize mx-auto w-full max-w-[760px]", className)}>
      <div className="rounded-xl border border-panel-border bg-[#08080a] p-2.5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.95)]">
        <div className="overflow-hidden rounded-md bg-black ring-1 ring-white/5">
          {screen}
        </div>
      </div>
      <div className="mx-auto mt-2 h-2 w-28 rounded-b-md bg-[#121214]" />
      <div className="mx-auto h-1.5 w-40 rounded-full bg-[#0e0e10]" />
    </div>
  )
}
