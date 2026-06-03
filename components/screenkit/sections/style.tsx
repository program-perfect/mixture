"use client"

import type { Locale } from "@/lib/screenkit/types"
import { LOCALES, LANG_LABEL } from "@/lib/screenkit/i18n"
import { SectionHeading, Explain, SegmentedControl } from "../primitives"
import { useScreenkit } from "../store"

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
