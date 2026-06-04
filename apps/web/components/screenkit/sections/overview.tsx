"use client"

import * as React from "react"
import { ArrowRight } from "lucide-react"
import {
  PROJECT_SUBTITLE,
  PROJECT_VERSION,
  resolveInsert,
} from "@/lib/screenkit/data"
import type { AspectRatio } from "@/lib/screenkit/types"
import { Pill } from "../primitives"
import { MotionNumber } from "../motion-number"
import { InsertPreview } from "../insert-preview"
import { useScreenkit } from "../store"
import { useReveal, staggerDelay } from "../motion"
import { PreviewTileSkeleton } from "../skeletons"

const ASPECT_RATIO: Record<AspectRatio, string> = {
  "9:16": "9/16",
  "16:9": "16/9",
  "4:3": "4/3",
  "16:10": "16/10",
}

/* shows a skeleton tile first, then smoothly crossfades to the (heavy) device
   preview once the reveal phase flips — gives a per-block skeleton -> content
   transition for the most expensive components on the page */
function RevealPreview({
  children,
  aspect,
}: {
  children: React.ReactNode
  aspect: AspectRatio
}) {
  const phase = useReveal(260)
  if (phase === "skeleton") {
    return <PreviewTileSkeleton aspect={ASPECT_RATIO[aspect] ?? "9/16"} />
  }
  return <div className="sk-animate-fade">{children}</div>
}

export function OverviewSection() {
  const {
    setSection,
    setFilters,
    openInPreview,
    t,
    insertLocaleFor,
    inserts,
    categories,
    catLabel,
  } = useScreenkit()

  const preferred = ["gs-011", "gs-001", "gs-008"]
  const featuredIds = preferred
    .filter((id) => inserts.some((i) => i.id === id))
    .concat(inserts.map((i) => i.id))
    .filter((id, idx, arr) => arr.indexOf(id) === idx)
    .slice(0, 3)

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <p className="font-mono text-xs lowercase text-text-faint">
          {PROJECT_VERSION}
        </p>
        <h1 className="text-balance font-mono text-4xl font-bold lowercase text-foreground sm:text-5xl">
          {t("project.name")}
        </h1>
        <p className="font-mono text-sm text-text-secondary">{PROJECT_SUBTITLE}</p>
        <p className="max-w-xl text-pretty font-mono text-[13px] leading-relaxed text-text-muted">
          {t("overview.lead")}
        </p>

        <div className="mt-1 flex flex-wrap gap-2">
          {categories.map((c) => (
            <Pill
              key={c.id}
              accent={c.accent}
              onClick={() => {
                setFilters((f) => ({ ...f, category: c.id }))
                setSection("library")
              }}
            >
              {catLabel(c.id)}
            </Pill>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap gap-3">
          <button
            onClick={() => setSection("library")}
            className="inline-flex items-center gap-2 rounded-full bg-control-active px-4 py-2 font-mono text-sm lowercase text-control-active-foreground transition-colors hover:opacity-90"
          >
            {t("overview.openLibrary")} <ArrowRight className="size-4" />
          </button>
          <button
            onClick={() => setSection("preview")}
            className="inline-flex items-center gap-2 rounded-full border border-panel-border bg-panel-soft px-4 py-2 font-mono text-sm lowercase text-foreground transition-colors hover:bg-panel-hover"
          >
            {t("overview.devicePreview")}
          </button>
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-sm lowercase text-text-secondary">
            {t("overview.recentInserts")}
          </h2>
          <span className="font-mono text-xs text-text-faint">
            <MotionNumber value={inserts.length} /> {t("overview.total")}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {featuredIds.map((id, idx) => {
            const base = inserts.find((i) => i.id === id)!
            const insert = resolveInsert(base, insertLocaleFor(id))
            return (
              <button
                key={id}
                onClick={() => openInPreview(id)}
                className="sk-animate-in group flex flex-col gap-3 text-left"
                style={staggerDelay(idx, 80)}
              >
                <RevealPreview aspect={insert.aspect}>
                  <InsertPreview
                    insert={insert}
                    settings={{
                      device: insert.device,
                      aspect: insert.aspect,
                      mode: "filmed",
                      brightness: 72,
                      noise: 30,
                      reflections: true,
                      scanlines: true,
                      timestamp: true,
                    }}
                  />
                </RevealPreview>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs lowercase text-text-secondary group-hover:text-foreground">
                    {insert.title}
                  </span>
                  <span className="font-mono text-[10px] text-text-faint">
                    {insert.episode}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
