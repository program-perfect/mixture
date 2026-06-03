"use client"

import { INSERTS } from "@/lib/screenkit/data"
import { SectionHeading, Explain, StatusBadge } from "../primitives"
import { useScreenkit } from "../store"

export function TimelineSection() {
  const { openInPreview } = useScreenkit()

  const byEpisode = INSERTS.reduce<Record<string, typeof INSERTS>>((acc, ins) => {
    ;(acc[ins.episode] ??= []).push(ins)
    return acc
  }, {})
  const episodes = Object.keys(byEpisode).sort()

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <SectionHeading title="production timeline" link />
        <Explain>
          every insert grouped by episode and scene, in shooting order. tap a
          row to load it into the device preview.
        </Explain>
      </header>

      <div className="flex flex-col gap-10">
        {episodes.map((ep) => (
          <section key={ep} className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold lowercase text-foreground">
                {ep}
              </span>
              <span className="h-px flex-1 bg-panel-border" />
              <span className="font-mono text-[11px] lowercase text-text-muted">
                {byEpisode[ep].length} inserts
              </span>
            </div>

            <ol className="flex flex-col">
              {byEpisode[ep]
                .sort((a, b) => a.scene.localeCompare(b.scene))
                .map((ins) => (
                  <li key={ins.id}>
                    <button
                      onClick={() => openInPreview(ins.id)}
                      className="group flex w-full items-center gap-4 border-b border-panel-border/60 py-3 text-left transition-colors last:border-0 hover:bg-panel-hover"
                    >
                      <span className="w-14 shrink-0 font-mono text-[12px] text-text-faint">
                        {ins.scene}
                      </span>
                      <span className="flex-1 truncate font-mono text-sm lowercase text-foreground group-hover:text-control-active-foreground">
                        {ins.title}
                      </span>
                      <span className="hidden shrink-0 font-mono text-[11px] text-text-muted sm:inline">
                        {ins.device}
                      </span>
                      <StatusBadge status={ins.status} />
                    </button>
                  </li>
                ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  )
}
