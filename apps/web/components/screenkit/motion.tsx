"use client"

import * as React from "react"

/* ------------------------------------------------------------------ *
 * motion preferences
 *
 * a single source of truth for "reduce motion". the resolved value is
 * mirrored onto <html data-motion="reduced|full"> so css can switch every
 * animation/transition off in one place (see globals.css).
 *
 * default behaviour (when the user has NOT made an explicit choice):
 *   • ON  (reduced) when the browser reports prefers-reduced-motion: reduce
 *   • ON  (reduced) when the device looks too slow to animate smoothly
 *   • OFF (full)    otherwise
 *
 * an explicit choice in settings is persisted and always wins, and it also
 * stops following the system preference afterwards.
 * ------------------------------------------------------------------ */

const MOTION_KEY = "screenkit-motion"

type MotionCtx = {
  /** true => animations are minimised */
  reduceMotion: boolean
  /** true once the preference has been resolved on the client (avoids flashes) */
  ready: boolean
  /** whether the value came from an explicit user choice vs auto-detection */
  isAuto: boolean
  setReduceMotion: (v: boolean) => void
  /** drop the explicit choice and follow the system / device heuristic again */
  resetToAuto: () => void
}

const MotionContext = React.createContext<MotionCtx | null>(null)

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/** rough "is this device too weak to animate" heuristic */
function isSlowDevice(): boolean {
  if (typeof navigator === "undefined") return false
  const cores = (navigator as Navigator & { hardwareConcurrency?: number })
    .hardwareConcurrency
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory

  // very low memory is a strong signal on its own
  if (typeof mem === "number" && mem > 0 && mem <= 2) return true
  // few cores combined with modest memory
  if (typeof cores === "number" && cores > 0 && cores <= 2) return true
  if (
    typeof cores === "number" &&
    cores > 0 &&
    cores <= 4 &&
    typeof mem === "number" &&
    mem > 0 &&
    mem <= 4
  )
    return true
  return false
}

function autoReduceMotion(): boolean {
  return prefersReducedMotion() || isSlowDevice()
}

function applyToDocument(reduce: boolean) {
  if (typeof document === "undefined") return
  document.documentElement.setAttribute("data-motion", reduce ? "reduced" : "full")
}

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [reduceMotion, setReduceMotionState] = React.useState(false)
  const [isAuto, setIsAuto] = React.useState(true)
  const [ready, setReady] = React.useState(false)

  // resolve the initial preference on the client
  React.useEffect(() => {
    let stored: string | null = null
    try {
      stored = window.localStorage.getItem(MOTION_KEY)
    } catch {
      // ignore
    }

    if (stored === "reduced" || stored === "full") {
      const reduce = stored === "reduced"
      setReduceMotionState(reduce)
      setIsAuto(false)
      applyToDocument(reduce)
    } else {
      const reduce = autoReduceMotion()
      setReduceMotionState(reduce)
      setIsAuto(true)
      applyToDocument(reduce)
    }
    setReady(true)
  }, [])

  // while still on auto, follow live changes of the system preference
  React.useEffect(() => {
    if (!isAuto || typeof window === "undefined" || !window.matchMedia) return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const onChange = () => {
      const reduce = autoReduceMotion()
      setReduceMotionState(reduce)
      applyToDocument(reduce)
    }
    mq.addEventListener?.("change", onChange)
    return () => mq.removeEventListener?.("change", onChange)
  }, [isAuto])

  const setReduceMotion = React.useCallback((v: boolean) => {
    setReduceMotionState(v)
    setIsAuto(false)
    applyToDocument(v)
    try {
      window.localStorage.setItem(MOTION_KEY, v ? "reduced" : "full")
    } catch {
      // ignore
    }
  }, [])

  const resetToAuto = React.useCallback(() => {
    try {
      window.localStorage.removeItem(MOTION_KEY)
    } catch {
      // ignore
    }
    const reduce = autoReduceMotion()
    setReduceMotionState(reduce)
    setIsAuto(true)
    applyToDocument(reduce)
  }, [])

  const value = React.useMemo<MotionCtx>(
    () => ({ reduceMotion, ready, isAuto, setReduceMotion, resetToAuto }),
    [reduceMotion, ready, isAuto, setReduceMotion, resetToAuto],
  )

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
}

export function useMotion() {
  const ctx = React.useContext(MotionContext)
  if (!ctx) throw new Error("useMotion must be used within MotionProvider")
  return ctx
}

/* ------------------------------------------------------------------ *
 * reveal: skeleton -> content gate
 *
 * returns the current phase for a freshly-mounted block. it starts on
 * "skeleton" and flips to "content" after a short, paint-aligned delay so the
 * real content fades in smoothly instead of popping in. when motion is reduced
 * the skeleton phase is skipped entirely and content shows immediately.
 *
 * because section wrappers are keyed by section, this hook re-runs on every
 * navigation, giving the "instant transition -> skeleton -> smooth reveal"
 * behaviour for each page.
 * ------------------------------------------------------------------ */

export function useReveal(delay = 220): "skeleton" | "content" {
  const { reduceMotion, ready } = useMotion()
  const [phase, setPhase] = React.useState<"skeleton" | "content">("skeleton")

  React.useEffect(() => {
    // not resolved yet, or user prefers reduced motion -> no skeleton flash
    if (!ready || reduceMotion) {
      setPhase("content")
      return
    }
    setPhase("skeleton")
    const id = window.setTimeout(() => setPhase("content"), delay)
    return () => window.clearTimeout(id)
  }, [ready, reduceMotion, delay])

  return phase
}

/** inline style helper for staggered enter animations */
export function staggerDelay(index: number, step = 45, max = 360): React.CSSProperties {
  return { "--sk-delay": `${Math.min(index * step, max)}ms` } as React.CSSProperties
}
