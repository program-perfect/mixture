"use client"

import * as React from "react"
import { Check, Moon, Sun, Monitor } from "lucide-react"
import type { Locale } from "@/lib/screenkit/types"
import { LOCALES, LANG_LABEL } from "@/lib/screenkit/i18n"
import { SectionHeading, Explain, SegmentedControl } from "../primitives"
import { useScreenkit } from "../store"
import { usePalette, useThemeMode, type Palette } from "../theme"

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
  const { palette, setPalette } = usePalette()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

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
                onClick={() => setTheme(o.value)}
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
    </>
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
    <div className="flex flex-col gap-8">
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
