"use client"

import { LANG_TAG, LOCALES } from "@/lib/screenkit/i18n"
import type { Locale } from "@/lib/screenkit/types"
import { cn } from "@/lib/utils"
import { Languages } from "lucide-react"
import { useScreenkit } from "./store"

/*
 * Per-insert language switch. Changes ONLY the content language inside the
 * given insert via a store override — it never touches the site language.
 * If the insert has no english translation, the english option is disabled
 * and a "ru only" badge is shown instead.
 */
export function InsertLanguageToggle({
  insertId,
  hasEnglish,
  compact = false,
  className,
}: {
  insertId: string
  hasEnglish: boolean
  compact?: boolean
  className?: string
}) {
  const { insertLocaleFor, setInsertLocale, t } = useScreenkit()
  const active = insertLocaleFor(insertId)

  if (!hasEnglish) {
    return (
      <span
        title={t("common.ruOnlyHint")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-dashed px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide",
          className,
        )}
        style={{
          color: "var(--accent-purple)",
          borderColor: "var(--accent-purple)",
          background: "rgba(108,99,255,0.08)",
        }}
      >
        <Languages className="size-3.5" />
        {t("common.ruOnly")}
      </span>
    )
  }

  return (
    <div
      role="group"
      aria-label={t("preview.insertLanguage")}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-panel-border bg-control p-1",
        className,
      )}
    >
      {!compact && (
        <Languages className="ml-1.5 size-3.5 text-text-faint" aria-hidden />
      )}
      {LOCALES.map((l: Locale) => {
        const isActive = l === active
        return (
          <button
            key={l}
            type="button"
            aria-pressed={isActive}
            onClick={() => setInsertLocale(insertId, l)}
            className={cn(
              "rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide transition-colors",
              isActive
                ? "bg-control-active text-control-active-foreground"
                : "text-text-secondary hover:bg-panel-hover hover:text-foreground",
            )}
          >
            {LANG_TAG[l]}
          </button>
        )
      })}
    </div>
  )
}
