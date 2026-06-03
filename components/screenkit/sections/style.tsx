"use client"

import { SectionHeading, Explain } from "../primitives"

const SWATCHES: { name: string; token: string }[] = [
  { name: "background", token: "var(--background)" },
  { name: "panel", token: "var(--panel-soft)" },
  { name: "control active", token: "var(--control-active)" },
  { name: "accent orange", token: "var(--accent-orange)" },
  { name: "accent green", token: "var(--accent-green)" },
  { name: "accent blue", token: "var(--accent-blue)" },
]

const RULES: string[] = [
  "monospace everywhere, lowercase labels. interface reads like a terminal, not a brochure.",
  "generic, unbranded device chrome. never reproduce a real product or logo.",
  "every insert is graded for the shot: clean, filmed-from-screen, or dirty playback.",
  "minimal chrome on set — only a quiet floating control, never a header or footer.",
  "fullscreen by default. the screen-state is the whole frame.",
]

export function StyleSection() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <SectionHeading title="style guide" link />
        <Explain>
          the visual language behind every screen insert — a cobalt-style
          terminal interface with vercel-grade restraint.
        </Explain>
      </header>

      <div className="flex flex-col gap-4">
        <SectionHeading title="palette" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SWATCHES.map((s) => (
            <div
              key={s.name}
              className="flex flex-col gap-2 rounded-2xl border border-panel-border bg-control p-3"
            >
              <span
                className="h-14 w-full rounded-xl border border-panel-border"
                style={{ background: s.token }}
              />
              <span className="font-mono text-[12px] lowercase text-text-secondary">
                {s.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <SectionHeading title="typography" />
        <div className="flex flex-col gap-3 rounded-2xl border border-panel-border bg-control px-5 py-5">
          <span className="font-mono text-2xl font-bold lowercase text-foreground">
            screen inserts
          </span>
          <span className="font-mono text-base text-text-secondary">
            geist mono · the quick brown fox 0123456789
          </span>
          <span className="font-mono text-[13px] text-text-muted">
            body copy stays in mono at a comfortable reading size with relaxed
            line-height.
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <SectionHeading title="principles" />
        <ul className="flex flex-col gap-2">
          {RULES.map((r) => (
            <li
              key={r}
              className="flex items-start gap-3 rounded-xl border border-panel-border bg-control px-4 py-3"
            >
              <span
                className="mt-1.5 size-1.5 shrink-0 rounded-full"
                style={{ background: "var(--accent-orange)" }}
              />
              <span className="font-mono text-[13px] lowercase text-text-secondary">
                {r}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
