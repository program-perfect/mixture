"use client"

import * as React from "react"
import { Download, FileJson, FileText } from "lucide-react"
import { INSERTS, PLAYBACK_MODES } from "@/lib/screenkit/data"
import type { PlaybackMode } from "@/lib/screenkit/types"
import { modeLabel, modeNote } from "@/lib/screenkit/i18n"
import { Switch } from "@/components/ui/switch"
import {
  SegmentedControl,
  SectionHeading,
  Explain,
  KeyVal,
} from "../primitives"
import { useScreenkit } from "../store"

type Format = "mp4" | "prores" | "png-seq" | "webm"
const FORMATS: { id: Format; labelKey: string; noteKey: string }[] = [
  { id: "mp4", labelKey: "export.fmt.mp4", noteKey: "export.fmt.mp4.note" },
  { id: "prores", labelKey: "export.fmt.prores", noteKey: "export.fmt.prores.note" },
  { id: "png-seq", labelKey: "export.fmt.pngSeq", noteKey: "export.fmt.pngSeq.note" },
  { id: "webm", labelKey: "export.fmt.webm", noteKey: "export.fmt.webm.note" },
]

export function ExportSection() {
  const { locale, t } = useScreenkit()
  const [format, setFormat] = React.useState<Format>("prores")
  const [mode, setMode] = React.useState<PlaybackMode>("filmed")
  const [burnIn, setBurnIn] = React.useState(true)
  const [loop, setLoop] = React.useState(true)

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <SectionHeading title={t("export.title")} link />
        <Explain>{t("export.desc")}</Explain>
      </header>

      <div className="flex flex-col gap-3">
        <SectionHeading title={t("export.format")} />
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
                <span className="font-mono text-sm lowercase">{t(f.labelKey)}</span>
                <span
                  className={
                    "font-mono text-[12px] " +
                    (active ? "opacity-80" : "text-text-muted")
                  }
                >
                  {t(f.noteKey)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <SectionHeading title={t("export.playbackLook")} />
        <SegmentedControl<PlaybackMode>
          options={PLAYBACK_MODES.map((m) => ({ value: m.id, label: modeLabel(m.id, locale) }))}
          value={mode}
          onChange={setMode}
        />
        <Explain>{modeNote(mode, locale)}</Explain>
      </div>

      <div className="flex flex-col gap-2">
        <SwitchRow
          title={t("export.burnIn")}
          desc={t("export.burnInDesc")}
          checked={burnIn}
          onChange={setBurnIn}
        />
        <SwitchRow
          title={t("export.loop")}
          desc={t("export.loopDesc")}
          checked={loop}
          onChange={setLoop}
        />
      </div>

      <div className="grid gap-2 rounded-2xl border border-panel-border bg-panel-soft px-4 py-3">
        <KeyVal label={t("export.queued")} value={INSERTS.length} />
        <KeyVal
          label={t("export.format")}
          value={t(FORMATS.find((f) => f.id === format)!.labelKey)}
        />
        <KeyVal
          label={t("export.look")}
          value={modeLabel(mode, locale)}
          accent="var(--accent-orange)"
        />
        <KeyVal
          label={t("export.estSize")}
          value={format === "prores" ? "~1.4 gb" : "~120 mb"}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-control-active px-4 py-3 font-mono text-sm lowercase text-control-active-foreground transition-opacity hover:opacity-90">
          <Download className="size-4" /> {t("export.renderQueue")} ({INSERTS.length})
        </button>
        <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-panel-border bg-control px-4 py-3 font-mono text-sm lowercase text-foreground transition-colors hover:bg-panel-hover">
          <FileJson className="size-4" /> {t("export.json")}
        </button>
        <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-panel-border bg-control px-4 py-3 font-mono text-sm lowercase text-foreground transition-colors hover:bg-panel-hover">
          <FileText className="size-4" /> {t("export.promptSheet")}
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
