"use client"

import * as React from "react"
import { Copy, Check } from "lucide-react"
import { INSERTS, getInsert, resolveInsert } from "@/lib/screenkit/data"
import { deviceLabel, statusLabel } from "@/lib/screenkit/i18n"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SectionHeading, Explain, StatusBadge, KeyVal } from "../primitives"
import { InsertLanguageToggle } from "../insert-language-toggle"
import { useScreenkit } from "../store"

function CopyBlock({
  label,
  value,
  copyLabel,
  copiedLabel,
}: {
  label: string
  value: string
  copyLabel: string
  copiedLabel: string
}) {
  const [copied, setCopied] = React.useState(false)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <SectionHeading title={label} />
        <button
          onClick={() => {
            navigator.clipboard?.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), 1400)
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-panel-border bg-control px-2.5 py-1 font-mono text-[11px] lowercase text-text-secondary transition-colors hover:bg-panel-hover hover:text-foreground"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-2xl border border-panel-border bg-control px-4 py-3.5 font-mono text-[13px] leading-relaxed text-text-secondary sk-scroll">
        <code className="whitespace-pre-wrap break-words">{value}</code>
      </pre>
    </div>
  )
}

export function PromptsSection() {
  const { selectedId, setSelectedId, locale, insertLocaleFor, t } = useScreenkit()
  const raw = getInsert(selectedId) ?? INSERTS[0]
  const insertLocale = insertLocaleFor(raw.id)
  const insert = resolveInsert(raw, insertLocale)

  const copyLabel = t("common.copy")
  const copiedLabel = t("common.copied")

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <SectionHeading title={t("prompts.title")} link />
        <Explain>{t("prompts.desc")}</Explain>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="h-11 w-full max-w-xs rounded-2xl border-panel-border bg-control font-mono text-sm lowercase text-foreground sm:w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-80 border-panel-border bg-popover font-mono">
              {INSERTS.map((i) => (
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
          <InsertLanguageToggle
            insertId={insert.id}
            hasEnglish={insert.hasEnglish}
            compact
          />
        </div>
      </header>

      <div className="grid gap-2 rounded-2xl border border-panel-border bg-panel-soft px-4 py-3">
        <KeyVal label={t("prompts.id")} value={insert.id} />
        <KeyVal
          label={t("prompts.episodeScene")}
          value={`${insert.episode} · ${insert.scene}`}
        />
        <KeyVal label={t("prompts.device")} value={deviceLabel(insert.device, locale)} />
        <KeyVal label={t("prompts.aspect")} value={insert.aspect} />
      </div>

      <CopyBlock
        label={t("prompts.full")}
        value={insert.prompt}
        copyLabel={copyLabel}
        copiedLabel={copiedLabel}
      />
      <CopyBlock
        label={t("prompts.short")}
        value={insert.shortPrompt}
        copyLabel={copyLabel}
        copiedLabel={copiedLabel}
      />
      <CopyBlock
        label={t("prompts.negative")}
        value={insert.negativePrompt}
        copyLabel={copyLabel}
        copiedLabel={copiedLabel}
      />

      <div className="flex flex-col gap-3">
        <SectionHeading title={t("prompts.notes")} />
        <ul className="flex flex-col gap-2">
          {insert.technicalNotes.map((note) => (
            <li
              key={note}
              className="flex items-start gap-3 rounded-xl border border-panel-border bg-control px-4 py-2.5"
            >
              <span
                className="mt-1.5 size-1.5 shrink-0 rounded-full"
                style={{ background: "var(--accent-green)" }}
              />
              <span className="font-mono text-[13px] lowercase text-text-secondary">
                {note}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
