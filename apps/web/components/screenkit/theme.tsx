"use client"

import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes"
import * as React from "react"
import { FluidCursor } from "./fluid-cursor"
import { MotionProvider, useMotion } from "./motion"

export const PALETTES = ["cobalt", "sunset", "forest", "mono"] as const
export type Palette = (typeof PALETTES)[number]

/* gradient intensity — user-personalisable, applied to accent surfaces
   (category tiles / icons / active accents). minimal by default. */
export const GRADIENT_LEVELS = ["off", "soft", "vivid"] as const
export type GradientLevel = (typeof GRADIENT_LEVELS)[number]

/* site scale / zoom — scales the root font-size so every rem-based size and
   spacing token grows or shrinks together. defaults a touch larger than 1. */
export const SCALE_LEVELS = ["compact", "normal", "large", "huge"] as const
export type ScaleLevel = (typeof SCALE_LEVELS)[number]
export const SCALE_VALUE: Record<ScaleLevel, number> = {
  compact: 0.92,
  normal: 1,
  large: 1.08,
  huge: 1.2,
}
const DEFAULT_SCALE: ScaleLevel = "large"
const DEFAULT_GLOW = true

const PALETTE_KEY = "screenkit-palette"
const GRADIENT_KEY = "screenkit-gradients"
const SCALE_KEY = "screenkit-scale"
const GLOW_KEY = "screenkit-glow"

type PaletteCtx = {
  palette: Palette
  setPalette: (p: Palette) => void
  gradients: GradientLevel
  setGradients: (g: GradientLevel) => void
  scale: ScaleLevel
  setScale: (s: ScaleLevel) => void
  glow: boolean
  setGlow: (enabled: boolean) => void
  /** run a dom mutation inside a crossfade view-transition (respects reduce-motion) */
  transition: (fn: () => void) => void
}

const PaletteContext = React.createContext<PaletteCtx | null>(null)

/* ------------------------------------------------------------------ *
 * accent surface helper
 * ------------------------------------------------------------------ */
export function accentSurface(
  accent: string,
  level: GradientLevel,
  active: boolean,
): string {
  if (level === "off") {
    return active ? accent : `color-mix(in srgb, ${accent} 16%, transparent)`
  }
  if (active) {
    const lo = level === "vivid" ? 70 : 84
    const hi = level === "vivid" ? 82 : 92
    return `linear-gradient(145deg, color-mix(in srgb, ${accent} ${lo}%, #ffffff) 0%, ${accent} 52%, color-mix(in srgb, ${accent} ${hi}%, #000000) 100%)`
  }
  const top = level === "vivid" ? 26 : 18
  const bot = level === "vivid" ? 12 : 8
  return `linear-gradient(145deg, color-mix(in srgb, ${accent} ${top}%, transparent), color-mix(in srgb, ${accent} ${bot}%, transparent))`
}

function PaletteProvider({ children }: { children: React.ReactNode }) {
  const { reduceMotion, features } = useMotion()
  const [palette, setPaletteState] = React.useState<Palette>("cobalt")
  const [gradients, setGradientsState] = React.useState<GradientLevel>("soft")
  const [scale, setScaleState] = React.useState<ScaleLevel>(DEFAULT_SCALE)
  const [glow, setGlowState] = React.useState(DEFAULT_GLOW)

  // hydrate from storage + apply to <html data-palette / data-gradients / data-glow / scale>
  React.useEffect(() => {
    let initialPalette: Palette = "cobalt"
    let initialGradients: GradientLevel = "soft"
    let initialScale: ScaleLevel = DEFAULT_SCALE
    let initialGlow = DEFAULT_GLOW
    try {
      const sp = window.localStorage.getItem(PALETTE_KEY)
      if (sp && (PALETTES as readonly string[]).includes(sp)) {
        initialPalette = sp as Palette
      }
      const sg = window.localStorage.getItem(GRADIENT_KEY)
      if (sg && (GRADIENT_LEVELS as readonly string[]).includes(sg)) {
        initialGradients = sg as GradientLevel
      }
      const ss = window.localStorage.getItem(SCALE_KEY)
      if (ss && (SCALE_LEVELS as readonly string[]).includes(ss)) {
        initialScale = ss as ScaleLevel
      }
      const glowSetting = window.localStorage.getItem(GLOW_KEY)
      if (glowSetting === "on" || glowSetting === "off") {
        initialGlow = glowSetting === "on"
      }
    } catch {
      // ignore
    }
    setPaletteState(initialPalette)
    setGradientsState(initialGradients)
    setScaleState(initialScale)
    setGlowState(initialGlow)
    document.documentElement.setAttribute("data-palette", initialPalette)
    document.documentElement.setAttribute("data-gradients", initialGradients)
    document.documentElement.setAttribute("data-glow", initialGlow ? "on" : "off")
    document.documentElement.style.setProperty(
      "--app-scale",
      String(SCALE_VALUE[initialScale]),
    )
  }, [])

  // crossfade helper using the View Transitions API (graceful fallback)
  const transition = React.useCallback(
    (fn: () => void) => {
      const doc = document as Document & {
        startViewTransition?: (cb: () => void) => unknown
      }
      if (
        reduceMotion ||
        !features.themeTransitions ||
        typeof document === "undefined" ||
        !doc.startViewTransition
      ) {
        fn()
        return
      }
      doc.startViewTransition(fn)
    },
    [reduceMotion, features.themeTransitions],
  )

  const setPalette = React.useCallback(
    (p: Palette) => {
      transition(() => {
        setPaletteState(p)
        document.documentElement.setAttribute("data-palette", p)
      })
      try {
        window.localStorage.setItem(PALETTE_KEY, p)
      } catch {
        // ignore
      }
    },
    [transition],
  )

  const setGradients = React.useCallback(
    (g: GradientLevel) => {
      transition(() => {
        setGradientsState(g)
        document.documentElement.setAttribute("data-gradients", g)
      })
      try {
        window.localStorage.setItem(GRADIENT_KEY, g)
      } catch {
        // ignore
      }
    },
    [transition],
  )

  const setScale = React.useCallback(
    (s: ScaleLevel) => {
      transition(() => {
        setScaleState(s)
        document.documentElement.style.setProperty(
          "--app-scale",
          String(SCALE_VALUE[s]),
        )
      })

      try {
        window.localStorage.setItem(SCALE_KEY, s)
      } catch {
        // ignore
      }
    },
    [transition],
  )

  const setGlow = React.useCallback(
    (enabled: boolean) => {
      transition(() => {
        setGlowState(enabled)
        document.documentElement.setAttribute("data-glow", enabled ? "on" : "off")
      })

      try {
        window.localStorage.setItem(GLOW_KEY, enabled ? "on" : "off")
      } catch {
        // ignore
      }
    },
    [transition],
  )

  const value = React.useMemo(
    () => ({
      palette,
      setPalette,
      gradients,
      setGradients,
      scale,
      setScale,
      glow,
      setGlow,
      transition,
    }),
    [
      palette,
      setPalette,
      gradients,
      setGradients,
      scale,
      setScale,
      glow,
      setGlow,
      transition,
    ],
  )

  return (
    <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>
  )
}

export function usePalette() {
  const ctx = React.useContext(PaletteContext)
  if (!ctx) throw new Error("usePalette must be used within ThemeProvider")
  return ctx
}

/** non-throwing accessor for the gradient level (safe in any client subtree) */
export function useGradients(): GradientLevel {
  const ctx = React.useContext(PaletteContext)
  return ctx?.gradients ?? "soft"
}

/** crossfade helper for theme-mode switches (light / dark / system) */
export function useThemeTransition() {
  const ctx = React.useContext(PaletteContext)
  return ctx?.transition ?? ((fn: () => void) => fn())
}

/* re-export next-themes hook for mode (light / dark / system) */
export function useThemeMode() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme()
  return { theme, setTheme, resolvedTheme, systemTheme }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange={false}
    >
      <MotionProvider>
        <PaletteProvider>
          {children}
          <FluidCursor />
        </PaletteProvider>
      </MotionProvider>
    </NextThemesProvider>
  )
}
