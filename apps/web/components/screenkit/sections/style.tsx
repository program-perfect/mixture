"use client"

import { LANG_LABEL, LOCALES } from "@/lib/screenkit/i18n"
import type { Locale } from "@/lib/screenkit/types"
import { Check, Monitor, Moon, Sun } from "lucide-react"
import * as React from "react"
import { LibraryListControls } from "../library-list-controls"
import { useMotion } from "../motion"
import { Explain, SectionHeading, SegmentedControl } from "../primitives"
import { useScreenkit, type ContentWidth } from "../store"
import {
  accentSurface,
  usePalette,
  useThemeMode,
  useThemeTransition,
  type GradientLevel,
  type Palette,
  type ScaleLevel,
} from "../theme"

type Mode = "light" | "dark" | "system"

// fixed swatches per palette (mirrors [data-palette="…"] in globals.css) so each
// preview card always shows ITS OWN colors, not the currently active palette.
const PALETTE_PREVIEW: { id: Palette; tokens: string[] }[] = [
  {
    id: "cobalt",
    tokens: ["#2f80ed", "#4cc9f0", "#22c55e", "#ff9f1c"],
  },
  {
    id: "sunset",
    tokens: ["#fb8500", "#e5383b", "#f72585", "#ffb703"],
  },
  {
    id: "forest",
    tokens: ["#2d6a4f", "#43cea2", "#2a9d8f", "#e9c46a"],
  },
  {
    id: "mono",
    tokens: ["#777777", "#8b8f99", "#a7abb4", "#b06a6a"],
  },
]

function ThemeControls() {
  const { t } = useScreenkit()
  const { theme, setTheme } = useThemeMode()
  const {
    palette,
    setPalette,
    gradients,
    setGradients,
    scale,
    setScale,
    glow,
    setGlow,
  } = usePalette()
  const transition = useThemeTransition()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const gradientOptions: { value: GradientLevel; label: string }[] = [
    { value: "off", label: t("theme.gradOff") },
    { value: "soft", label: t("theme.gradSoft") },
    { value: "vivid", label: t("theme.gradVivid") },
  ]

  const scaleOptions: { value: ScaleLevel; label: string }[] = [
    { value: "compact", label: t("scale.compact") },
    { value: "normal", label: t("scale.normal") },
    { value: "large", label: t("scale.large") },
    { value: "huge", label: t("scale.huge") },
  ]

  const mode = (mounted ? (theme as Mode) : "dark") ?? "dark"

  const modeOptions: { value: Mode; label: string; icon: React.ReactNode }[] = [
    { value: "dark", label: t("theme.dark"), icon: <Moon className="size-3.5" /> },
    { value: "light", label: t("theme.light"), icon: <Sun className="size-3.5" /> },
    { value: "system", label: t("theme.system"), icon: <Monitor className="size-3.5" /> },
  ]

  return (
    <>
      <div className="flex flex-col gap-3">
        <SectionHeading title={t("theme.mode")} />
        <div className="grid grid-cols-3 gap-2">
          {modeOptions.map((o) => {
            const active = mode === o.value
            return (
              <button
                key={o.value}
                onClick={() => transition(() => setTheme(o.value))}
                aria-pressed={active}
                className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 font-mono text-sm lowercase transition-colors ${
                  active
                    ? "border-transparent bg-control-active text-control-active-foreground"
                    : "border-panel-border bg-control text-text-secondary hover:bg-panel-hover hover:text-foreground"
                }`}
              >
                {o.icon}
                {o.label}
              </button>
            )
          })}
        </div>
        <Explain>{t("theme.modeDesc")}</Explain>
      </div>

      <div className="flex flex-col gap-3">
        <SectionHeading title={t("theme.palette")} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PALETTE_PREVIEW.map((p) => {
            const active = palette === p.id
            return (
              <button
                key={p.id}
                onClick={() => setPalette(p.id)}
                aria-pressed={active}
                className={`flex flex-col gap-3 rounded-2xl border p-3 text-left transition-colors ${
                  active
                    ? "border-ring bg-panel-hover"
                    : "border-panel-border bg-control hover:bg-panel-hover"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {p.tokens.map((tk, i) => (
                    <span
                      key={i}
                      className="size-5 rounded-full border border-panel-border"
                      style={{ background: tk }}
                    />
                  ))}
                </span>
                <span className="flex items-center justify-between">
                  <span className="font-mono text-[12px] lowercase text-text-secondary">
                    {t(`palette.${p.id}`)}
                  </span>
                  {active ? (
                    <Check className="size-3.5 text-foreground" />
                  ) : null}
                </span>
              </button>
            )
          })}
        </div>
        <Explain>{t("theme.paletteDesc")}</Explain>
      </div>

      <div className="flex flex-col gap-3">
        <SectionHeading title={t("theme.gradients")} />
        <SegmentedControl<GradientLevel>
          options={gradientOptions}
          value={gradients}
          onChange={setGradients}
        />
        {/* live preview of the gradient choice on accent tiles */}
        <div className="flex items-center gap-2">
          {["var(--accent-blue)", "var(--accent-green)", "var(--accent-orange)", "var(--accent-purple)"].map(
            (accent, i) => (
              <span
                key={i}
                className="size-10 rounded-[10px] border border-panel-border"
                style={{ background: accentSurface(accent, gradients, true) }}
              />
            ),
          )}
        </div>
        <Explain>{t("theme.gradientsDesc")}</Explain>
      </div>

      <div className="flex flex-col gap-3">
        <SectionHeading title="glow эффект" />
        <SegmentedControl<"on" | "off">
          options={[
            { value: "on", label: "включён" },
            { value: "off", label: "выключен" },
          ]}
          value={glow ? "on" : "off"}
          onChange={(value) => setGlow(value === "on")}
        />
        <Explain>
          добавляет raycast-like внутреннюю окантовку и мягкое свечение к основным поверхностям интерфейса.
        </Explain>
      </div>

      <div className="flex flex-col gap-3">
        <SectionHeading title={t("scale.title")} />
        <SegmentedControl<ScaleLevel>
          options={scaleOptions}
          value={scale}
          onChange={setScale}
        />
        <Explain>{t("scale.desc")}</Explain>
      </div>
    </>
  )
}

type MotionChoice = "auto" | "full" | "reduced"

function MotionControls() {
  const { t } = useScreenkit()
  const { reduceMotion, isAuto, setReduceMotion, resetToAuto } = useMotion()

  const value: MotionChoice = isAuto ? "auto" : reduceMotion ? "reduced" : "full"

  const onChange = (choice: MotionChoice) => {
    if (choice === "auto") resetToAuto()
    else if (choice === "full") setReduceMotion(false)
    else setReduceMotion(true)
  }

  const note = isAuto
    ? reduceMotion
      ? t("motion.autoNoteOn")
      : t("motion.autoNoteOff")
    : reduceMotion
      ? t("motion.manualOn")
      : t("motion.manualOff")

  return (
    <div className="flex flex-col gap-3">
      <SectionHeading title={t("motion.title")} />
      <SegmentedControl<MotionChoice>
        options={[
          { value: "auto", label: t("motion.auto") },
          { value: "full", label: t("motion.full") },
          { value: "reduced", label: t("motion.reduced") },
        ]}
        value={value}
        onChange={onChange}
      />
      <Explain>{t("motion.desc")}</Explain>
      <span className="font-mono text-[12px] lowercase text-text-faint">
        {note}
      </span>
    </div>
  )
}

function LayoutWidthControls() {
  const { contentWidth, setContentWidth } = useScreenkit()

  return (
    <div className="hidden flex-col gap-3 md:flex">
      <SectionHeading title="ширина основной части" />
      <SegmentedControl<ContentWidth>
        options={[
          { value: "narrow", label: "узкая" },
          { value: "default", label: "обычная" },
          { value: "wide", label: "широкая" },
        ]}
        value={contentWidth}
        onChange={setContentWidth}
      />
      <Explain>
        работает только на экранах, где есть левая панель. на узких версиях с верхним меню содержимое всегда занимает всю доступную ширину.
      </Explain>
    </div>
  )
}

const SWATCHES: { key: string; token: string }[] = [
  { key: "style.sw.background", token: "var(--background)" },
  { key: "style.sw.panel", token: "var(--panel-soft)" },
  { key: "style.sw.controlActive", token: "var(--control-active)" },
  { key: "style.sw.accentOrange", token: "var(--accent-orange)" },
  { key: "style.sw.accentGreen", token: "var(--accent-green)" },
  { key: "style.sw.accentBlue", token: "var(--accent-blue)" },
]

const RULE_KEYS = [
  "style.rule.1",
  "style.rule.2",
  "style.rule.3",
  "style.rule.4",
  "style.rule.5",
]

export function StyleSection() {
  const { locale, setLocale, t } = useScreenkit()

  return (
    <div className="flex min-w-0 flex-col gap-8">
      <header className="flex flex-col gap-3">
        <SectionHeading title={t("style.title")} link />
        <Explain>{t("style.desc")}</Explain>
      </header>

      {/* site language */}
      <div className="flex flex-col gap-3">
        <SectionHeading title={t("style.language")} />
        <SegmentedControl<Locale>
          options={LOCALES.map((l) => ({ value: l, label: LANG_LABEL[l] }))}
          value={locale}
          onChange={setLocale}
        />
        <Explain>{t("style.languageDesc")}</Explain>
      </div>

      <MotionControls />

      <LayoutWidthControls />

      <LibraryListControls variant="settings" />

      <ThemeControls />

      <div className="flex flex-col gap-4">
        <SectionHeading title={t("style.palette")} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SWATCHES.map((s) => (
            <div
              key={s.key}
              className="flex flex-col gap-2 rounded-2xl border border-panel-border bg-control p-3"
            >
              <span
                className="h-14 w-full rounded-xl border border-panel-border"
                style={{ background: s.token }}
              />
              <span className="font-mono text-[12px] lowercase text-text-secondary">
                {t(s.key)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <SectionHeading title={t("style.typography")} />
        <div className="flex flex-col gap-3 rounded-2xl border border-panel-border bg-control px-5 py-5">
          <span className="font-mono text-2xl font-bold lowercase text-foreground">
            {t("style.typeSample")}
          </span>
          <span className="font-mono text-base text-text-secondary">
            {t("style.typeMono")}
          </span>
          <span className="font-mono text-[13px] text-text-muted">
            {t("style.typeBody")}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <SectionHeading title={t("style.principles")} />
        <ul className="flex flex-col gap-2">
          {RULE_KEYS.map((r) => (
            <li
              key={r}
              className="flex items-start gap-3 rounded-xl border border-panel-border bg-control px-4 py-3"
            >
              <span
                className="mt-1.5 size-1.5 shrink-0 rounded-full"
                style={{ background: "var(--accent-orange)" }}
              />
              <span className="font-mono text-[13px] lowercase text-text-secondary">
                {t(r)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
