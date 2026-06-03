"use client"

import * as React from "react"
import { Download, FileJson, FileText } from "lucide-react"
import { INSERTS, PLAYBACK_MODES } from "@/lib/screenkit/data"
import type { PlaybackMode } from "@/lib/screenkit/types"
import { Switch } from "@/components/ui/switch"
import {
  SegmentedControl,
  SectionHeading,
  Explain,
  KeyVal,
} from "../primitives"

type Format = "mp4" | "prores" | "png-seq" | "webm"
const FORMATS: { id: Format; label: string; note: string }[] = [
  { id: "mp4", label: "mp4 h.264", note: "universal delivery, small files." },
  { id: "prores", label: "prores 422", note: "editorial master, large files." },
  { id: "png-seq", label: "png sequence", note: "per-frame compositing source." },
  { id: "webm", label: "webm vp9", note: "web preview, alpha support." },
]

export function ExportSection() {
  const [format, setFormat] = React.useState<Format>("prores")
  const [mode, setMode] = React.useState<PlaybackMode>("filmed")
  const [burnIn, setBurnIn] = React.useState(true)
  const [loop, setLoop] = React.useState(true)

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <SectionHeading title="render & export" link />
        <Explain>
          bake the graded insert to a delivery format for editorial. choose a
          codec, a playback look, and metadata burn-in.
        </Explain>
      </header>

      <div className="flex flex-col gap-3">
        <SectionHeading title="format" />
        <div className="grid gap-2 sm:grid-cols-2">
          {FORMATS.map((f) => {
            const active = f.id === format
            return (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={
                  "flex flex-col gap-1 rounded-2xl border px-4 py-3.5 text-left transition-colors " +
                  (active
                    ? "border-transparent bg-control-active text-control-active-foreground"
                    : "border-panel-border bg-control text-foreground hover:bg-panel-hover")
                }
              >
                <span className="font-mono text-sm lowercase">{f.label}</span>
                <span
                  className={
                    "font-mono text-[12px] " +
                    (active ? "opacity-80" : "text-text-muted")
                  }
                >
                  {f.note}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <SectionHeading title="playback look" />
        <SegmentedControl<PlaybackMode>
          options={PLAYBACK_MODES.map((m) => ({ value: m.id, label: m.label }))}
          value={mode}
          onChange={setMode}
        />
        <Explain>{PLAYBACK_MODES.find((m) => m.id === mode)?.note}</Explain>
      </div>

      <div className="flex flex-col gap-2">
        <SwitchRow
          title="metadata burn-in"
          desc="episode, scene and id baked into the corner."
          checked={burnIn}
          onChange={setBurnIn}
        />
        <SwitchRow
          title="seamless loop"
          desc="render a perfect loop for on-set playback."
          checked={loop}
          onChange={setLoop}
        />
      </div>

      <div className="grid gap-2 rounded-2xl border border-panel-border bg-panel-soft px-4 py-3">
        <KeyVal label="queued inserts" value={INSERTS.length} />
        <KeyVal label="format" value={FORMATS.find((f) => f.id === format)?.label} />
        <KeyVal label="look" value={mode} accent="var(--accent-orange)" />
        <KeyVal label="est. size" value={format === "prores" ? "~1.4 gb" : "~120 mb"} />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-control-active px-4 py-3 font-mono text-sm lowercase text-control-active-foreground transition-opacity hover:opacity-90">
          <Download className="size-4" /> render queue ({INSERTS.length})
        </button>
        <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-panel-border bg-control px-4 py-3 font-mono text-sm lowercase text-foreground transition-colors hover:bg-panel-hover">
          <FileJson className="size-4" /> export json
        </button>
        <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-panel-border bg-control px-4 py-3 font-mono text-sm lowercase text-foreground transition-colors hover:bg-panel-hover">
          <FileText className="size-4" /> prompt sheet
        </button>
      </div>
    </div>
  )
}

function SwitchRow({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string
  desc: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-panel-border bg-control px-4 py-3.5">
      <div className="flex flex-col gap-1">
        <span className="font-mono text-sm lowercase text-foreground">{title}</span>
        <span className="font-mono text-[12px] text-text-muted">{desc}</span>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
