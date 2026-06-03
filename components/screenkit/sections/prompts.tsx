"use client"

import * as React from "react"
import { Copy, Check } from "lucide-react"
import { INSERTS, getInsert } from "@/lib/screenkit/data"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SectionHeading, Explain, StatusBadge, KeyVal } from "../primitives"
import { useScreenkit } from "../store"

function CopyBlock({ label, value }: { label: string; value: string }) {
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
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-2xl border border-panel-border bg-control px-4 py-3.5 font-mono text-[13px] leading-relaxed text-text-secondary sk-scroll">
        <code className="whitespace-pre-wrap break-words">{value}</code>
      </pre>
    </div>
  )
}

export function PromptsSection() {
  const { selectedId, setSelectedId } = useScreenkit()
  const insert = getInsert(selectedId) ?? INSERTS[0]

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <SectionHeading title="prompt sheet" link />
        <Explain>
          generation-ready prompts for each insert. negative prompts and
          technical notes keep every screen consistent and brand-safe.
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

      <div className="grid gap-2 rounded-2xl border border-panel-border bg-panel-soft px-4 py-3">
        <KeyVal label="id" value={insert.id} />
        <KeyVal label="episode / scene" value={`${insert.episode} · ${insert.scene}`} />
        <KeyVal label="device" value={insert.device} />
        <KeyVal label="aspect" value={insert.aspect} />
      </div>

      <CopyBlock label="full prompt" value={insert.prompt} />
      <CopyBlock label="short prompt" value={insert.shortPrompt} />
      <CopyBlock label="negative prompt" value={insert.negativePrompt} />

      <div className="flex flex-col gap-3">
        <SectionHeading title="technical notes" />
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
