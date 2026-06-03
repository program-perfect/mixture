"use client"

import * as React from "react"
import { Link2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { InsertStatus } from "@/lib/screenkit/types"
import { statusAccent } from "@/lib/screenkit/data"

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
  // derive the inactive tile background from the accent so it tracks the
  // active palette. the literal `tint` is only a fallback for non-accent uses.
  const inactiveBg = accent
    ? `color-mix(in srgb, ${accent} 16%, transparent)`
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
        background: active ? accent : inactiveBg,
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
              "flex-1 rounded-xl text-center font-mono font-medium lowercase transition-colors",
              size === "sm" ? "px-2 py-1.5 text-xs" : "px-3 py-2.5 text-sm",
              active
                ? "bg-control-active text-control-active-foreground"
                : "text-text-secondary hover:bg-panel-hover hover:text-foreground",
            )}
          >
            {opt.label}
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
        "flex items-center gap-2 font-mono text-base font-bold lowercase text-foreground",
        className,
      )}
    >
      {title}
      {link ? <Link2 className="size-3.5 text-text-faint" /> : null}
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
        "max-w-xl text-pretty font-mono text-[13px] leading-relaxed text-text-muted",
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
  return <div className={cn("flex flex-col gap-3", className)}>{children}</div>
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
      className="inline-flex items-center gap-1.5 rounded-full border border-panel-border bg-panel-soft px-2.5 py-1 font-mono text-[11px] lowercase"
      style={{ color: accent }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ background: accent }}
      />
      {label ?? status}
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
        "inline-flex items-center gap-1 rounded-full border border-dashed px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide",
        className,
      )}
      style={{
        color: "var(--accent-purple)",
        borderColor: "var(--accent-purple)",
        background: "rgba(108,99,255,0.08)",
      }}
    >
      {label}
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
  const Comp = onClick ? "button" : "span"
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs lowercase transition-colors",
        active
          ? "border-transparent bg-control-active text-control-active-foreground"
          : "border-panel-border bg-panel-soft text-text-secondary hover:bg-panel-hover hover:text-foreground",
        className,
      )}
    >
      {accent ? (
        <span
          className="size-1.5 rounded-full"
          style={{ background: accent }}
        />
      ) : null}
      {children}
    </Comp>
  )
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
    <div className="flex items-center justify-between gap-4 border-b border-panel-border/60 py-2 last:border-0">
      <span className="font-mono text-[12px] lowercase text-text-muted">
        {label}
      </span>
      <span
        className="text-right font-mono text-[12px]"
        style={{ color: accent ?? "var(--text-primary)" }}
      >
        {value}
      </span>
    </div>
  )
}
