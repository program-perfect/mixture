"use client"

import Link from "next/link"
import { Maximize2 } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DEVICES,
  PLAYBACK_MODES,
  resolveInsert,
} from "@/lib/screenkit/data"
import type { AspectRatio, DeviceType, PlaybackMode } from "@/lib/screenkit/types"
import {
  deviceLabel,
  modeLabel,
  modeNote,
  statusLabel,
} from "@/lib/screenkit/i18n"
import {
  SegmentedControl,
  SectionHeading,
  Explain,
  StatusBadge,
} from "../primitives"
import { InsertPreview } from "../insert-preview"
import { InsertLanguageToggle } from "../insert-language-toggle"
import { useScreenkit } from "../store"

const ASPECTS: AspectRatio[] = ["9:16", "16:9", "4:3", "16:10"]

export function PreviewSection() {
  const {
    selectedId,
    setSelectedId,
    preview,
    setPreview,
    locale,
    insertLocaleFor,
    t,
    inserts,
    getInsert,
  } = useScreenkit()
  const raw = getInsert(selectedId) ?? inserts[0]
  // the device content uses the per-insert language; the chrome uses the site language
  const insertLocale = insertLocaleFor(raw.id)
  const insert = resolveInsert(raw, insertLocale)

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <SectionHeading title={t("preview.title")} link />
        <Explain>{t("preview.desc")}</Explain>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="h-11 w-full max-w-xs rounded-2xl border-panel-border bg-control font-mono text-sm lowercase text-foreground sm:w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-80 border-panel-border bg-popover font-mono">
              {inserts.map((i) => (
                <SelectItem key={i.id} value={i.id} className="lowercase">
                  {resolveInsert(i, locale).title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <StatusBadge
            status={insert.status}
            label={statusLabel(insert.status, locale)}
          />
        </div>
      </header>

      {/* per-insert language control — independent of the site language */}
      <div className="flex flex-col gap-3 rounded-2xl border border-panel-border bg-control px-4 py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-sm lowercase text-foreground">
            {t("preview.insertLanguage")}
          </span>
          <InsertLanguageToggle
            insertId={insert.id}
            hasEnglish={insert.hasEnglish}
          />
        </div>
        <span className="font-mono text-[12px] leading-relaxed text-text-muted">
          {t("preview.insertLanguageDesc")}
        </span>
      </div>

      {/* preview stage */}
      <div className="flex items-center justify-center rounded-3xl border border-panel-border bg-[radial-gradient(120%_120%_at_50%_0%,#0e0e10,#000)] px-4 py-10">
        <InsertPreview insert={insert} settings={preview} />
      </div>

      {/* open as screen-state */}
      <Link
        href={`/insert/${insert.id}`}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-control-active px-4 py-3 font-mono text-sm lowercase text-control-active-foreground transition-opacity hover:opacity-90"
      >
        <Maximize2 className="size-4" /> {t("preview.openFullscreen")}
      </Link>

      {/* controls */}
      <div className="flex flex-col gap-7">
        <Control title={t("preview.deviceFormat")} desc={t("preview.deviceFormatDesc")}>
          <SegmentedControl<DeviceType>
            options={DEVICES.map((d) => ({ value: d.id, label: deviceLabel(d.id, locale) }))}
            value={preview.device}
            onChange={(device) => setPreview((p) => ({ ...p, device }))}
            size="sm"
          />
        </Control>

        <Control title={t("preview.playbackMode")} desc={modeNote(preview.mode, locale)}>
          <SegmentedControl<PlaybackMode>
            options={PLAYBACK_MODES.map((m) => ({ value: m.id, label: modeLabel(m.id, locale) }))}
            value={preview.mode}
            onChange={(mode) => setPreview((p) => ({ ...p, mode }))}
          />
        </Control>

        <Control title={t("preview.aspect")} desc={t("preview.aspectDesc")}>
          <SegmentedControl<AspectRatio>
            options={ASPECTS.map((a) => ({ value: a, label: a }))}
            value={preview.aspect}
            onChange={(aspect) => setPreview((p) => ({ ...p, aspect }))}
            size="sm"
          />
        </Control>

        <SliderControl
          title={t("preview.brightness")}
          value={preview.brightness}
          onChange={(brightness) => setPreview((p) => ({ ...p, brightness }))}
          desc={t("preview.brightnessDesc")}
        />
        <SliderControl
          title={t("preview.noise")}
          value={preview.noise}
          onChange={(noise) => setPreview((p) => ({ ...p, noise }))}
          desc={t("preview.noiseDesc")}
        />

        <SwitchControl
          title={t("preview.reflections")}
          desc={t("preview.reflectionsDesc")}
          checked={preview.reflections}
          onChange={(reflections) => setPreview((p) => ({ ...p, reflections }))}
        />
        <SwitchControl
          title={t("preview.scanlines")}
          desc={t("preview.scanlinesDesc")}
          checked={preview.scanlines}
          onChange={(scanlines) => setPreview((p) => ({ ...p, scanlines }))}
        />
        <SwitchControl
          title={t("preview.timestamp")}
          desc={t("preview.timestampDesc")}
          checked={preview.timestamp}
          onChange={(timestamp) => setPreview((p) => ({ ...p, timestamp }))}
        />
      </div>
    </div>
  )
}

function Control({
  title,
  desc,
  children,
}: {
  title: string
  desc?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <SectionHeading title={title} />
      {children}
      {desc ? <Explain>{desc}</Explain> : null}
    </div>
  )
}

function SliderControl({
  title,
  value,
  onChange,
  desc,
}: {
  title: string
  value: number
  onChange: (v: number) => void
  desc: string
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <SectionHeading title={title} />
        <span className="font-mono text-xs text-text-secondary">{value}</span>
      </div>
      <Slider
        value={[value]}
        min={0}
        max={100}
        step={1}
        onValueChange={(v) => onChange(v[0])}
      />
      <Explain>{desc}</Explain>
    </div>
  )
}

function SwitchControl({
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
