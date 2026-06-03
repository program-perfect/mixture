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
  INSERTS,
  getInsert,
} from "@/lib/screenkit/data"
import type { AspectRatio, DeviceType, PlaybackMode } from "@/lib/screenkit/types"
import {
  SegmentedControl,
  SectionHeading,
  Explain,
  StatusBadge,
} from "../primitives"
import { InsertPreview } from "../insert-preview"
import { useScreenkit } from "../store"

const ASPECTS: AspectRatio[] = ["9:16", "16:9", "4:3", "16:10"]

export function PreviewSection() {
  const { selectedId, setSelectedId, preview, setPreview } = useScreenkit()
  const insert = getInsert(selectedId) ?? INSERTS[0]

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <SectionHeading title="device preview" link />
        <Explain>
          load an insert onto a device frame and grade it for the shot. clean
          source, filmed-from-screen, or dirty playback.
        </Explain>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="h-11 w-full max-w-xs rounded-2xl border-panel-border bg-control font-mono text-sm lowercase text-foreground sm:w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-80 border-panel-border bg-popover font-mono">
              {INSERTS.map((i) => (
                <SelectItem key={i.id} value={i.id} className="lowercase">
                  {i.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <StatusBadge status={insert.status} />
        </div>
      </header>

      {/* preview stage */}
      <div className="flex items-center justify-center rounded-3xl border border-panel-border bg-[radial-gradient(120%_120%_at_50%_0%,#0e0e10,#000)] px-4 py-10">
        <InsertPreview insert={insert} settings={preview} />
      </div>

      {/* open as screen-state */}
      <Link
        href={`/insert/${insert.id}`}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-control-active px-4 py-3 font-mono text-sm lowercase text-control-active-foreground transition-opacity hover:opacity-90"
      >
        <Maximize2 className="size-4" /> open as fullscreen screen-state
      </Link>

      {/* controls */}
      <div className="flex flex-col gap-7">
        <Control title="device format" desc="the physical screen the insert appears on.">
          <SegmentedControl<DeviceType>
            options={DEVICES.map((d) => ({ value: d.id, label: d.label }))}
            value={preview.device}
            onChange={(device) => setPreview((p) => ({ ...p, device }))}
            size="sm"
          />
        </Control>

        <Control title="playback mode" desc={PLAYBACK_MODES.find((m) => m.id === preview.mode)?.note ?? ""}>
          <SegmentedControl<PlaybackMode>
            options={PLAYBACK_MODES.map((m) => ({ value: m.id, label: m.label }))}
            value={preview.mode}
            onChange={(mode) => setPreview((p) => ({ ...p, mode }))}
          />
        </Control>

        <Control title="aspect ratio" desc="frame the insert to match the prop device.">
          <SegmentedControl<AspectRatio>
            options={ASPECTS.map((a) => ({ value: a, label: a }))}
            value={preview.aspect}
            onChange={(aspect) => setPreview((p) => ({ ...p, aspect }))}
            size="sm"
          />
        </Control>

        <SliderControl
          title="brightness"
          value={preview.brightness}
          onChange={(brightness) => setPreview((p) => ({ ...p, brightness }))}
          desc="screen luminance and falloff."
        />
        <SliderControl
          title="noise"
          value={preview.noise}
          onChange={(noise) => setPreview((p) => ({ ...p, noise }))}
          desc="sensor grain and compression artefacts."
        />

        <SwitchControl
          title="reflections"
          desc="screen glare and room reflections when filmed."
          checked={preview.reflections}
          onChange={(reflections) => setPreview((p) => ({ ...p, reflections }))}
        />
        <SwitchControl
          title="scanlines"
          desc="crt / interlace scanline pattern."
          checked={preview.scanlines}
          onChange={(scanlines) => setPreview((p) => ({ ...p, scanlines }))}
        />
        <SwitchControl
          title="timestamp"
          desc="burned-in date/time overlay."
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
