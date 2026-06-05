"use client"

import { cn } from "@/lib/utils"
import * as React from "react"

/* ------------------------------------------------------------------ *
 * skeleton primitives + per-section skeletons
 *
 * each skeleton mirrors the real layout shape of its section so the
 * "skeleton -> content" crossfade does not shift the page. the shimmer is
 * defined in globals.css (.sk-skeleton) and is automatically disabled when
 * motion is reduced.
 * ------------------------------------------------------------------ */

export function Skeleton({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return <span className={cn("sk-skeleton block", className)} style={style} aria-hidden />
}

function Lines({ count, className }: { count: number; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3 rounded-md"
          style={{ width: `${90 - i * (60 / Math.max(count, 1))}%` }}
        />
      ))}
    </div>
  )
}

/** generic wrapper that fades the skeleton in and labels it for a11y */
export function SkeletonWrap({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="sk-skeleton-wrap"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">загрузка…</span>
      {children}
    </div>
  )
}

/* ------------------------------- overview ------------------------------- */

export function OverviewSkeleton() {
  return (
    <SkeletonWrap>
      <div className="flex flex-col gap-10">
        <header className="flex flex-col gap-4">
          <Skeleton className="h-3 w-24 rounded-md" />
          <Skeleton className="h-11 w-3/4 rounded-xl" />
          <Skeleton className="h-3 w-1/2 rounded-md" />
          <Lines count={3} className="max-w-xl" />
          <div className="mt-1 flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-3">
            <Skeleton className="h-10 w-40 rounded-full" />
            <Skeleton className="h-10 w-40 rounded-full" />
          </div>
        </header>
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-32 rounded-md" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="aspect-[9/16] w-full rounded-2xl" />
                <Skeleton className="h-3 w-2/3 rounded-md" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </SkeletonWrap>
  )
}

/* a single device-preview placeholder, used while a heavy scene mounts */
export function PreviewTileSkeleton({
  aspect = "9/16",
  className,
}: {
  aspect?: string
  className?: string
}) {
  return (
    <Skeleton
      className={cn("w-full rounded-2xl", className)}
      style={{ aspectRatio: aspect }}
    />
  )
}

/* ------------------------------- library ------------------------------- */

export function LibrarySkeleton() {
  return (
    <SkeletonWrap>
      <div className="flex flex-col gap-7">
        <header className="flex flex-col gap-3">
          <Skeleton className="h-5 w-48 rounded-md" />
          <Lines count={2} className="max-w-xl" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-28 rounded-full" />
            <Skeleton className="h-9 w-32 rounded-full" />
            <Skeleton className="h-9 w-28 rounded-full" />
          </div>
        </header>
        <Skeleton className="h-11 w-full rounded-2xl" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, r) => (
            <div key={r} className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-3 w-16 rounded-md" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-20 rounded-full" />
              ))}
            </div>
          ))}
        </div>
        <ul className="flex flex-col gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-2xl border border-panel-border bg-panel-soft p-3"
            >
              <Skeleton className="size-10 shrink-0 rounded-[10px]" />
              <div className="min-w-0 flex-1 flex-col gap-2">
                <Skeleton className="h-3 w-1/2 rounded-md" />
                <Skeleton className="mt-2 h-3 w-3/4 rounded-md" />
                <Skeleton className="mt-2 h-2.5 w-2/3 rounded-md" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </SkeletonWrap>
  )
}

/* ------------------------------- preview ------------------------------- */

export function PreviewSkeleton() {
  return (
    <SkeletonWrap>
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <Skeleton className="h-5 w-40 rounded-md" />
          <Lines count={2} className="max-w-xl" />
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-11 w-64 rounded-2xl" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
        </header>
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="flex items-center justify-center rounded-3xl border border-panel-border bg-panel-soft px-4 py-10">
          <Skeleton className="aspect-[9/16] w-56 max-w-full rounded-2xl" />
        </div>
        <Skeleton className="h-12 w-full rounded-2xl" />
        <div className="flex flex-col gap-7">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="h-3 w-32 rounded-md" />
              <Skeleton className="h-10 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    </SkeletonWrap>
  )
}

/* ------------------------------- timeline ------------------------------- */

export function TimelineSkeleton() {
  return (
    <SkeletonWrap>
      <div className="flex flex-col gap-7">
        <header className="flex flex-col gap-3">
          <Skeleton className="h-5 w-56 rounded-md" />
          <Lines count={2} className="max-w-xl" />
        </header>
        <div className="flex flex-col gap-6">
          {Array.from({ length: 3 }).map((_, g) => (
            <div key={g} className="flex flex-col gap-3">
              <Skeleton className="h-3 w-28 rounded-md" />
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-2xl" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </SkeletonWrap>
  )
}

/* ------------------------------- prompts ------------------------------- */

export function PromptsSkeleton() {
  return (
    <SkeletonWrap>
      <div className="flex flex-col gap-7">
        <header className="flex flex-col gap-3">
          <Skeleton className="h-5 w-40 rounded-md" />
          <Lines count={2} className="max-w-xl" />
        </header>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-4 rounded-2xl border border-panel-border bg-panel-soft p-4"
          >
            <Skeleton className="h-4 w-1/3 rounded-md" />
            <Lines count={3} />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </SkeletonWrap>
  )
}

/* ------------------------------- appearance ------------------------------- */

export function StyleSkeleton() {
  return (
    <SkeletonWrap>
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <Skeleton className="h-5 w-40 rounded-md" />
          <Lines count={2} className="max-w-xl" />
        </header>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="h-4 w-32 rounded-md" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-12 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </SkeletonWrap>
  )
}

/* ------------------------------- about ------------------------------- */

export function AboutSkeleton() {
  return (
    <SkeletonWrap>
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <Skeleton className="h-5 w-32 rounded-md" />
          <Lines count={3} className="max-w-xl" />
        </header>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    </SkeletonWrap>
  )
}
