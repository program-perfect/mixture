"use client"

import * as React from "react"

/* ------------------------------------------------------------------ *
 * motion preferences
 *
 * Main reduce-motion mode still works as the master accessibility switch.
 * Advanced feature flags let the user disable specific animation families while
 * keeping the rest of the UI animated. The custom fluid cursor is intentionally
 * independent from reduce-motion: it stays animated unless its own switch is off.
 * ------------------------------------------------------------------ */

const MOTION_KEY = "screenkit-motion"
const MOTION_FEATURES_KEY = "screenkit-motion-features-v2"

export const MOTION_FEATURE_KEYS = [
  "sections",
  "layout",
  "skeletons",
  "scroll",
  "viewTransitions",
  "cursor",
] as const

export type MotionFeature = (typeof MOTION_FEATURE_KEYS)[number]
export type MotionFeatures = Record<MotionFeature, boolean>

export const DEFAULT_MOTION_FEATURES: MotionFeatures = {
  sections: true,
  layout: true,
  skeletons: true,
  scroll: true,
  viewTransitions: true,
  cursor: true,
}

const FEATURE_ATTRS: Record<MotionFeature, string> = {
  sections: "data-motion-sections",
  layout: "data-motion-layout",
  skeletons: "data-motion-skeletons",
  scroll: "data-motion-scroll",
  viewTransitions: "data-motion-theme",
  cursor: "data-fluid-cursor",
}

type LegacyMotionFeatures = Partial<MotionFeatures> & { themeTransitions?: boolean }

type MotionCtx = {
  /** true => animations are minimised */
  reduceMotion: boolean
  /** true once the preference has been resolved on the client (avoids flashes) */
  ready: boolean
  /** whether the value came from an explicit user choice vs auto-detection */
  isAuto: boolean
  features: MotionFeatures
  setReduceMotion: (v: boolean) => void
  /** drop the explicit choice and follow the system / device heuristic again */
  resetToAuto: () => void
  setMotionFeature: (feature: MotionFeature, enabled: boolean) => void
  resetMotionFeatures: () => void
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

function normalizeMotionFeatures(parsed: LegacyMotionFeatures): MotionFeatures {
  return MOTION_FEATURE_KEYS.reduce<MotionFeatures>(
    (acc, key) => {
      if (key === "viewTransitions") {
        acc[key] =
          typeof parsed.viewTransitions === "boolean"
            ? parsed.viewTransitions
            : typeof parsed.themeTransitions === "boolean"
              ? parsed.themeTransitions
              : DEFAULT_MOTION_FEATURES[key]
        return acc
      }
      acc[key] =
        typeof parsed[key] === "boolean"
          ? parsed[key]
          : DEFAULT_MOTION_FEATURES[key]
      return acc
    },
    { ...DEFAULT_MOTION_FEATURES },
  )
}

function readMotionFeatures(): MotionFeatures {
  if (typeof window === "undefined") return DEFAULT_MOTION_FEATURES

  try {
    const raw =
      window.localStorage.getItem(MOTION_FEATURES_KEY) ??
      window.localStorage.getItem("screenkit-motion-features-v1")
    if (!raw) return DEFAULT_MOTION_FEATURES
    return normalizeMotionFeatures(JSON.parse(raw) as LegacyMotionFeatures)
  } catch {
    return DEFAULT_MOTION_FEATURES
  }
}

function writeMotionFeatures(features: MotionFeatures) {
  try {
    window.localStorage.setItem(MOTION_FEATURES_KEY, JSON.stringify(features))
  } catch {
    // ignore
  }
}

function applyToDocument(reduce: boolean, features: MotionFeatures) {
  if (typeof document === "undefined") return
  document.documentElement.setAttribute("data-motion", reduce ? "reduced" : "full")

  for (const key of MOTION_FEATURE_KEYS) {
    document.documentElement.setAttribute(FEATURE_ATTRS[key], features[key] ? "on" : "off")
  }
}

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [reduceMotion, setReduceMotionState] = React.useState(false)
  const [isAuto, setIsAuto] = React.useState(true)
  const [ready, setReady] = React.useState(false)
  const [features, setFeaturesState] = React.useState<MotionFeatures>(DEFAULT_MOTION_FEATURES)

  // resolve the initial preference on the client
  React.useEffect(() => {
    const initialFeatures = readMotionFeatures()
    setFeaturesState(initialFeatures)

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
      applyToDocument(reduce, initialFeatures)
    } else {
      const reduce = autoReduceMotion()
      setReduceMotionState(reduce)
      setIsAuto(true)
      applyToDocument(reduce, initialFeatures)
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
      applyToDocument(reduce, features)
    }
    mq.addEventListener?.("change", onChange)
    return () => mq.removeEventListener?.("change", onChange)
  }, [isAuto, features])

  const setReduceMotion = React.useCallback(
    (v: boolean) => {
      setReduceMotionState(v)
      setIsAuto(false)
      applyToDocument(v, features)
      try {
        window.localStorage.setItem(MOTION_KEY, v ? "reduced" : "full")
      } catch {
        // ignore
      }
    },
    [features],
  )

  const resetToAuto = React.useCallback(() => {
    try {
      window.localStorage.removeItem(MOTION_KEY)
    } catch {
      // ignore
    }
    const reduce = autoReduceMotion()
    setReduceMotionState(reduce)
    setIsAuto(true)
    applyToDocument(reduce, features)
  }, [features])

  const setMotionFeature = React.useCallback(
    (feature: MotionFeature, enabled: boolean) => {
      setFeaturesState((prev) => {
        const next = { ...prev, [feature]: enabled }
        writeMotionFeatures(next)
        applyToDocument(reduceMotion, next)
        return next
      })
    },
    [reduceMotion],
  )

  const resetMotionFeatures = React.useCallback(() => {
    setFeaturesState(DEFAULT_MOTION_FEATURES)
    writeMotionFeatures(DEFAULT_MOTION_FEATURES)
    applyToDocument(reduceMotion, DEFAULT_MOTION_FEATURES)
  }, [reduceMotion])

  const value = React.useMemo<MotionCtx>(
    () => ({
      reduceMotion,
      ready,
      isAuto,
      features,
      setReduceMotion,
      resetToAuto,
      setMotionFeature,
      resetMotionFeatures,
    }),
    [
      reduceMotion,
      ready,
      isAuto,
      features,
      setReduceMotion,
      resetToAuto,
      setMotionFeature,
      resetMotionFeatures,
    ],
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
 * ------------------------------------------------------------------ */

export function useReveal(delay = 220): "skeleton" | "content" {
  const { reduceMotion, ready, features } = useMotion()
  const [phase, setPhase] = React.useState<"skeleton" | "content">("skeleton")

  React.useEffect(() => {
    // not resolved yet, master reduce-motion, or skeletons disabled -> no skeleton flash
    if (!ready || reduceMotion || !features.skeletons) {
      setPhase("content")
      return
    }
    setPhase("skeleton")
    const id = window.setTimeout(() => setPhase("content"), delay)
    return () => window.clearTimeout(id)
  }, [ready, reduceMotion, features.skeletons, delay])

  return phase
}

/** inline style helper for staggered enter animations */
export function staggerDelay(index: number, step = 45, max = 360): React.CSSProperties {
  return { "--sk-delay": `${Math.min(index * step, max)}ms` } as React.CSSProperties
}
