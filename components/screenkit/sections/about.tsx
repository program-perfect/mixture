"use client"

import {
  PROJECT_NAME,
  PROJECT_SUBTITLE,
  PROJECT_VERSION,
  INSERTS,
  CATEGORIES,
} from "@/lib/screenkit/data"
import { SectionHeading, Explain, KeyVal } from "../primitives"

export function AboutSection() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <SectionHeading title="about" link />
        <Explain>
          {PROJECT_NAME} — {PROJECT_SUBTITLE}. a prop playback system that
          designs, grades and delivers the fake screens you see in a crime
          series: phones, cctv feeds, trackers, news tickers and bank terminals.
        </Explain>
      </header>

      <div className="grid gap-2 rounded-2xl border border-panel-border bg-panel-soft px-4 py-3">
        <KeyVal label="version" value={PROJECT_VERSION} />
        <KeyVal label="total inserts" value={INSERTS.length} />
        <KeyVal label="categories" value={CATEGORIES.length} />
        <KeyVal label="default mode" value="fullscreen" accent="var(--accent-green)" />
      </div>

      <div className="flex flex-col gap-4">
        <SectionHeading title="architecture" />
        <Explain>
          built as a service-oriented workspace: each insert opens as its own
          isolated fullscreen screen-state with no shared header or footer —
          only a quiet floating control for back, fullscreen and orientation.
          the structure maps directly onto a turborepo apps/* layout so each
          surface can graduate into its own deployable app.
        </Explain>
        <div className="grid gap-2 rounded-2xl border border-panel-border bg-control px-4 py-3">
          <KeyVal label="shell" value="next.js · react · tailwind v4" />
          <KeyVal label="ui" value="shadcn / radix primitives" />
          <KeyVal label="screen-states" value={`/insert/[id]`} />
          <KeyVal label="formfactors" value="mobile → tv" />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <SectionHeading title="catalogue" />
        <div className="flex flex-col">
          {CATEGORIES.map((c) => {
            const count = INSERTS.filter((i) => i.category === c.id).length
            return (
              <div
                key={c.id}
                className="flex items-center justify-between gap-4 border-b border-panel-border/60 py-2.5 last:border-0"
              >
                <span className="font-mono text-sm lowercase text-foreground">
                  {c.label}
                </span>
                <span className="font-mono text-[12px] text-text-muted">
                  {count} inserts
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
