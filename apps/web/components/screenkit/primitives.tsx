"use client"

import { statusAccent } from "@/lib/screenkit/data"
import type { InsertStatus } from "@/lib/screenkit/types"
import { cn } from "@/lib/utils"
import { Link2 } from "lucide-react"
import * as React from "react"
import { accentSurface, useGradients } from "./theme"

/* ----------------------------- icon tile ----------------------------- */

export function IconTile({
  icon: Icon,
  accent,
  tint,
  active,
  className,
  size = 36,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  accent: string
  tint?: string
  active?: boolean
  className?: string
  size?: number
}) {
  // resolve the tile background through the gradient helper so it tracks both
  // the active palette and the user's gradient preference. a single-hue
  // gradient keeps it minimal; `tint` stays a fallback for non-accent uses.
  const gradients = useGradients()
  const baseAccent = accent || "var(--accent-grey)"
  const background = accent
    ? accentSurface(baseAccent, gradients, !!active)
    : active
      ? baseAccent
      : tint ?? "rgba(255,255,255,0.04)"
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[10px] border",
        className,
      )}
      style={{
        width: size,
        height: size,
        background,
        borderColor: active ? "transparent" : "var(--panel-border)",
      }}
    >
      <Icon
        className="size-[18px]"
        style={{ color: active ? "#050505" : accent }}
      />
    </span>
  )
}

/* -------------------------- segmented control -------------------------- */

export type SegmentOption<T extends string> = { value: T; label: string }

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  size = "md",
}: {
  options: SegmentOption<T>[]
  value: T
  onChange: (v: T) => void
  className?: string
  size?: "sm" | "md"
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex w-full gap-1 rounded-2xl border border-panel-border bg-control p-1",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "min-w-0 flex-1 rounded-xl text-center font-mono font-medium lowercase transition-colors",
              size === "sm" ? "px-2 py-1.5 text-xs" : "px-3 py-2.5 text-sm",
              active
                ? "bg-control-active text-control-active-foreground"
                : "text-text-secondary hover:bg-panel-hover hover:text-foreground",
            )}
          >
            <span className="block truncate">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ----------------------------- section heading ----------------------------- */

export function SectionHeading({
  title,
  link,
  className,
}: {
  title: string
  link?: boolean
  className?: string
}) {
  return (
    <h3
      className={cn(
        "flex min-w-0 items-center gap-2 font-mono text-base font-bold lowercase text-foreground",
        className,
      )}
    >
      <span className="min-w-0 truncate">{title}</span>
      {link ? <Link2 className="size-3.5 shrink-0 text-text-faint" /> : null}
    </h3>
  )
}

export function Explain({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p
      className={cn(
        "max-w-xl text-pretty font-mono text-[13px] leading-relaxed text-text-muted [overflow-wrap:anywhere]",
        className,
      )}
    >
      {children}
    </p>
  )
}

export function FormRow({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn("flex min-w-0 flex-col gap-3", className)}>{children}</div>
}

/* ----------------------------- status badge ----------------------------- */

export function StatusBadge({
  status,
  label,
}: {
  status: InsertStatus
  label?: string
}) {
  const accent = statusAccent(status)
  return (
    <span
      className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-panel-border bg-panel-soft px-2.5 py-1 font-mono text-[11px] lowercase"
      style={{ color: accent }}
    >
      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{ background: accent }}
      />
      <span className="min-w-0 truncate">{label ?? status}</span>
    </span>
  )
}

/* badge shown on inserts that have no english translation */
export function RuOnlyBadge({
  label,
  title,
  className,
}: {
  label: string
  title?: string
  className?: string
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-full border border-dashed px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide",
        className,
      )}
      style={{
        color: "var(--accent-purple)",
        borderColor: "var(--accent-purple)",
        background: "rgba(108,99,255,0.08)",
      }}
    >
      <span className="min-w-0 truncate">{label}</span>
    </span>
  )
}

/* ----------------------------- pill ----------------------------- */

export function Pill({
  children,
  accent,
  active,
  onClick,
  className,
}: {
  children: React.ReactNode
  accent?: string
  active?: boolean
  onClick?: () => void
  className?: string
}) {
  const pillClassName = cn(
    "inline-flex min-w-0 items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs lowercase transition-colors",
    active
      ? "border-transparent bg-control-active text-control-active-foreground"
      : "border-panel-border bg-panel-soft text-text-secondary hover:bg-panel-hover hover:text-foreground",
    className,
  )

  const content = (
    <>
      {accent ? (
        <span
          className="size-1.5 shrink-0 rounded-full"
          style={{ background: accent }}
        />
      ) : null}
      {children}
    </>
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={pillClassName}>
        {content}
      </button>
    )
  }

  return <span className={pillClassName}>{content}</span>
}

/* ----------------------------- key/value row ----------------------------- */

export function KeyVal({
  label,
  value,
  accent,
}: {
  label: string
  value: React.ReactNode
  accent?: string
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-4 border-b border-panel-border/60 py-2 last:border-0">
      <span className="min-w-0 truncate font-mono text-[11px] lowercase text-text-faint">
        {label}
      </span>
      <span
        className="min-w-0 truncate text-right font-mono text-xs text-text-secondary"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </span>
    </div>
  )
}
