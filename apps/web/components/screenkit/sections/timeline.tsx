"use client"

import { resolveInsert } from "@/lib/screenkit/data"
import { deviceLabel, statusLabel } from "@/lib/screenkit/i18n"
import type { Insert } from "@/lib/screenkit/types"
import { MotionNumber } from "../motion-number"
import { Explain, RuOnlyBadge, SectionHeading, StatusBadge } from "../primitives"
import { useScreenkit } from "../store"

export function TimelineSection() {
  const { openInPreview, locale, t, inserts } = useScreenkit()

  const byEpisode = inserts.reduce<Record<string, Insert[]>>((acc, ins) => {
    ;(acc[ins.episode] ??= []).push(ins)
    return acc
  }, {})
  const episodes = Object.keys(byEpisode).sort()

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <SectionHeading title={t("timeline.title")} link />
        <Explain>{t("timeline.desc")}</Explain>
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
                <MotionNumber value={byEpisode[ep].length} /> {t("library.countMany")}
              </span>
            </div>

            <ol className="flex flex-col">
              {byEpisode[ep]
                .sort((a, b) => a.scene.localeCompare(b.scene))
                .map((raw) => {
                  const ins = resolveInsert(raw, locale)
                  return (
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
                        {!ins.hasEnglish && (
                          <RuOnlyBadge
                            label={t("common.ruOnly")}
                            title={t("common.ruOnlyHint")}
                            className="hidden sm:inline-flex"
                          />
                        )}
                        <span className="hidden shrink-0 font-mono text-[11px] text-text-muted sm:inline">
                          {deviceLabel(ins.device, locale)}
                        </span>
                        <StatusBadge
                          status={ins.status}
                          label={statusLabel(ins.status, locale)}
                        />
                      </button>
                    </li>
                  )
                })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  )
}
