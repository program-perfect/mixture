"use client"

import { ArrowRight } from "lucide-react"
import {
  CATEGORIES,
  INSERTS,
  PROJECT_NAME,
  PROJECT_SUBTITLE,
  PROJECT_VERSION,
} from "@/lib/screenkit/data"
import { Pill } from "../primitives"
import { InsertPreview } from "../insert-preview"
import { useScreenkit } from "../store"

export function OverviewSection() {
  const { setSection, setFilters, openInPreview } = useScreenkit()

  const featured = [
    INSERTS.find((i) => i.id === "gs-011")!, // tracker
    INSERTS.find((i) => i.id === "gs-001")!, // mannequin cctv
    INSERTS.find((i) => i.id === "gs-008")!, // phone call
  ]

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <p className="font-mono text-xs lowercase text-text-faint">
          {PROJECT_VERSION}
        </p>
        <h1 className="text-balance font-mono text-4xl font-bold lowercase text-foreground sm:text-5xl">
          {PROJECT_NAME}
        </h1>
        <p className="font-mono text-sm text-text-secondary">{PROJECT_SUBTITLE}</p>
        <p className="max-w-xl text-pretty font-mono text-[13px] leading-relaxed text-text-muted">
          a private art-department tool to design, preview, organize and export
          the screen inserts seen on phones, monitors, cctv feeds and tv sets
          across the series. not a downloader. not a converter. just props.
        </p>

        <div className="mt-1 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Pill
              key={c.id}
              accent={c.accent}
              onClick={() => {
                setFilters((f) => ({ ...f, category: c.id }))
                setSection("library")
              }}
            >
              {c.label}
            </Pill>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap gap-3">
          <button
            onClick={() => setSection("library")}
            className="inline-flex items-center gap-2 rounded-full bg-control-active px-4 py-2 font-mono text-sm lowercase text-control-active-foreground transition-colors hover:opacity-90"
          >
            open library <ArrowRight className="size-4" />
          </button>
          <button
            onClick={() => setSection("preview")}
            className="inline-flex items-center gap-2 rounded-full border border-panel-border bg-panel-soft px-4 py-2 font-mono text-sm lowercase text-foreground transition-colors hover:bg-panel-hover"
          >
            device preview
          </button>
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-sm lowercase text-text-secondary">
            recent inserts
          </h2>
          <span className="font-mono text-xs text-text-faint">
            {INSERTS.length} total
          </span>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {featured.map((insert) => (
            <button
              key={insert.id}
              onClick={() => openInPreview(insert.id)}
              className="group flex flex-col gap-3 text-left"
            >
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
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs lowercase text-text-secondary group-hover:text-foreground">
                  {insert.title}
                </span>
                <span className="font-mono text-[10px] text-text-faint">
                  {insert.episode}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
