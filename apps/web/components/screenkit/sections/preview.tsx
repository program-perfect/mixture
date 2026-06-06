"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  DEVICES,
  PLAYBACK_MODES,
  resolveInsert,
} from "@/lib/screenkit/data"
import {
  deviceLabel,
  modeLabel,
  modeNote,
  statusLabel,
} from "@/lib/screenkit/i18n"
import type { AspectRatio, DeviceType, PlaybackMode } from "@/lib/screenkit/types"
import { Maximize2 } from "lucide-react"
import Link from "next/link"
import * as React from "react"
import { InsertLanguageToggle } from "../insert-language-toggle"
import { InsertPreview } from "../insert-preview"
import { MotionNumber } from "../motion-number"
import {
  Explain,
  SectionHeading,
  SegmentedControl,
  StatusBadge,
} from "../primitives"
import { useScreenkit, type MessengerTheme, type MessengerVideoFormat } from "../store"

const MESSENGER_THEMES: MessengerTheme[] = ["dark", "light"]
const MESSENGER_VIDEO_FORMATS: MessengerVideoFormat[] = [
  "mixed",
  "vertical",
  "horizontal",
  "square",
]

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
  const isMessenger = insert.id === "gs-009"
  const previewForInsert = React.useMemo(
    () => ({
      ...preview,
      aspect: insert.aspect,
    }),
    [insert.aspect, preview],
  )

  React.useEffect(() => {
    if (preview.aspect !== insert.aspect) {
      setPreview((current) => ({ ...current, aspect: insert.aspect }))
    }
  }, [insert.aspect, preview.aspect, setPreview])

  const selectInsert = React.useCallback(
    (id: string) => {
      const next = getInsert(id)
      setSelectedId(id)
      if (next) {
        setPreview((current) => ({
          ...current,
          device: next.device,
          aspect: next.aspect,
        }))
      }
    },
    [getInsert, setPreview, setSelectedId],
  )

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <SectionHeading title={t("preview.title")} link />
        <Explain>{t("preview.desc")}</Explain>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedId} onValueChange={selectInsert}>
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
      <div className="flex min-w-0 items-center justify-center overflow-hidden rounded-3xl border border-panel-border bg-[radial-gradient(120%_120%_at_50%_0%,#0e0e10,#000)] px-3 py-6 sm:px-4 sm:py-8 lg:py-10">
        <InsertPreview insert={insert} settings={previewForInsert} />
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
            options={[{ value: insert.aspect, label: insert.aspect }]}
            value={previewForInsert.aspect}
            onChange={() => undefined}
            size="sm"
          />
        </Control>

        {isMessenger && (
          <div className="flex flex-col gap-5 rounded-3xl border border-panel-border bg-panel-soft p-4 sm:p-5">
            <Control
              title="настройки мессенджера"
              desc="управляют только этой вставкой: задержкой входящего сообщения, темой, видео и плавностью анимаций."
            >
              <SegmentedControl<MessengerTheme>
                options={MESSENGER_THEMES.map((theme) => ({
                  value: theme,
                  label: theme === "dark" ? "тёмная" : "светлая",
                }))}
                value={preview.messengerTheme}
                onChange={(messengerTheme) =>
                  setPreview((p) => ({ ...p, messengerTheme }))
                }
                size="sm"
              />
            </Control>

            <SliderControl
              title="задержка сообщения"
              value={preview.messengerDelay}
              min={0}
              max={12}
              suffix=" сек."
              onChange={(messengerDelay) =>
                setPreview((p) => ({ ...p, messengerDelay }))
              }
              desc="через сколько секунд неизвестный контакт отправит сообщение и пачку видео."
            />

            <Control title="формат видео" desc="влияет на карточки входящих видео и открытый видеоплеер.">
              <SegmentedControl<MessengerVideoFormat>
                options={MESSENGER_VIDEO_FORMATS.map((format) => ({
                  value: format,
                  label:
                    format === "mixed"
                      ? "разные"
                      : format === "vertical"
                        ? "9:16"
                        : format === "horizontal"
                          ? "16:9"
                          : "1:1",
                }))}
                value={preview.messengerVideoFormat}
                onChange={(messengerVideoFormat) =>
                  setPreview((p) => ({ ...p, messengerVideoFormat }))
                }
                size="sm"
              />
            </Control>

            <SwitchControl
              title="плавные анимации"
              desc="по умолчанию выключены; включает мягкое появление сообщений и переход в плеер."
              checked={preview.messengerMotion}
              onChange={(messengerMotion) =>
                setPreview((p) => ({ ...p, messengerMotion }))
              }
            />
            <SwitchControl
              title="скрытый номер"
              desc="маскирует номер неизвестного отправителя в шапке чата."
              checked={preview.messengerHiddenNumber}
              onChange={(messengerHiddenNumber) =>
                setPreview((p) => ({ ...p, messengerHiddenNumber }))
              }
            />
          </div>
        )}

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
  min = 0,
  max = 100,
  suffix = "",
}: {
  title: string
  value: number
  onChange: (v: number) => void
  desc: string
  min?: number
  max?: number
  suffix?: string
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <SectionHeading title={title} />
        <span className="font-mono text-xs text-text-secondary">
          <MotionNumber value={value} />{suffix}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
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
    <div className="flex flex-col gap-3 rounded-2xl border border-panel-border bg-control px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex flex-col gap-1">
        <span className="font-mono text-sm lowercase text-foreground">{title}</span>
        <span className="font-mono text-[12px] text-text-muted">{desc}</span>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
