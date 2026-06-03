"use client"

import {
  PROJECT_SUBTITLE,
  PROJECT_VERSION,
  INSERTS,
  CATEGORIES,
} from "@/lib/screenkit/data"
import { categoryLabel } from "@/lib/screenkit/i18n"
import { SectionHeading, Explain, KeyVal } from "../primitives"
import { LicensesList } from "../licenses-list"
import { useScreenkit } from "../store"

export function AboutSection() {
  const { locale, t } = useScreenkit()

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <SectionHeading title={t("about.title")} link />
        <Explain>
          {t("project.name")} — {PROJECT_SUBTITLE}. {t("about.desc")}
        </Explain>
      </header>

      <div className="grid gap-2 rounded-2xl border border-panel-border bg-panel-soft px-4 py-3">
        <KeyVal label={t("about.version")} value={PROJECT_VERSION} />
        <KeyVal label={t("about.totalInserts")} value={INSERTS.length} />
        <KeyVal label={t("about.categories")} value={CATEGORIES.length} />
        <KeyVal
          label={t("about.defaultMode")}
          value={t("about.fullscreen")}
          accent="var(--accent-green)"
        />
      </div>

      <div className="flex flex-col gap-4">
        <SectionHeading title={t("about.architecture")} />
        <Explain>{t("about.archDesc")}</Explain>
        <div className="grid gap-2 rounded-2xl border border-panel-border bg-control px-4 py-3">
          <KeyVal label={t("about.shell")} value="next.js · react · tailwind v4" />
          <KeyVal label={t("about.ui")} value="shadcn / radix primitives" />
          <KeyVal label={t("about.screenStates")} value={`/insert/[id]`} />
          <KeyVal label={t("about.formfactors")} value={t("about.formfactorsValue")} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <SectionHeading title={t("about.catalogue")} />
        <div className="flex flex-col">
          {CATEGORIES.map((c) => {
            const count = INSERTS.filter((i) => i.category === c.id).length
            return (
              <div
                key={c.id}
                className="flex items-center justify-between gap-4 border-b border-panel-border/60 py-2.5 last:border-0"
              >
                <span className="font-mono text-sm lowercase text-foreground">
                  {categoryLabel(c.id, locale)}
                </span>
                <span className="font-mono text-[12px] text-text-muted">
                  {count} {t("about.insertsSuffix")}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <LicensesList />
    </div>
  )
}
