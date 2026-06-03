"use client"

import * as React from "react"
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes"

export const PALETTES = ["cobalt", "sunset", "forest", "mono"] as const
export type Palette = (typeof PALETTES)[number]

const PALETTE_KEY = "screenkit-palette"

type PaletteCtx = {
  palette: Palette
  setPalette: (p: Palette) => void
}

const PaletteContext = React.createContext<PaletteCtx | null>(null)

function PaletteProvider({ children }: { children: React.ReactNode }) {
  const [palette, setPaletteState] = React.useState<Palette>("cobalt")

  // hydrate from storage + apply to <html data-palette>
  React.useEffect(() => {
    let initial: Palette = "cobalt"
    try {
      const stored = window.localStorage.getItem(PALETTE_KEY)
      if (stored && (PALETTES as readonly string[]).includes(stored)) {
        initial = stored as Palette
      }
    } catch {
      // ignore
    }
    setPaletteState(initial)
    document.documentElement.setAttribute("data-palette", initial)
  }, [])

  const setPalette = React.useCallback((p: Palette) => {
    setPaletteState(p)
    document.documentElement.setAttribute("data-palette", p)
    try {
      window.localStorage.setItem(PALETTE_KEY, p)
    } catch {
      // ignore
    }
  }, [])

  const value = React.useMemo(() => ({ palette, setPalette }), [palette, setPalette])

  return (
    <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>
  )
}

export function usePalette() {
  const ctx = React.useContext(PaletteContext)
  if (!ctx) throw new Error("usePalette must be used within ThemeProvider")
  return ctx
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
      disableTransitionOnChange
    >
      <PaletteProvider>{children}</PaletteProvider>
    </NextThemesProvider>
  )
}
