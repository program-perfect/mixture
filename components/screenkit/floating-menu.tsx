"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Maximize,
  Minimize,
  RotateCw,
  Lock,
  LockOpen,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Locale } from "@/lib/screenkit/types"
import { DEFAULT_LOCALE, translate } from "@/lib/screenkit/i18n"

type Orientation = "landscape" | "portrait"

export function FloatingMenu({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const router = useRouter()
  const t = (key: string) => translate(locale, key)
  const [open, setOpen] = React.useState(false)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [orientation, setOrientation] = React.useState<Orientation>("landscape")
  const [locked, setLocked] = React.useState(false)

  // request fullscreen by default on mount (best-effort, requires gesture on some browsers)
  React.useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])

  const toggleFullscreen = React.useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await document.documentElement.requestFullscreen()
      }
    } catch {
      // fullscreen may be blocked; ignore
    }
  }, [])

  const toggleOrientation = React.useCallback(() => {
    if (locked) return
    setOrientation((o) => (o === "landscape" ? "portrait" : "landscape"))
  }, [locked])

  // apply orientation as a rotation on the stage element
  React.useEffect(() => {
    const stage = document.getElementById("screen-stage")
    if (!stage) return
    stage.dataset.orientation = orientation
  }, [orientation])

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
      {/* expanded actions */}
      <div
        className={cn(
          "flex flex-col items-end gap-2 transition-all duration-200",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0",
        )}
      >
        <MenuButton
          label={t("fm.back")}
          onClick={() => router.push("/")}
          icon={ArrowLeft}
        />
        <MenuButton
          label={isFullscreen ? t("fm.exitFullscreen") : t("fm.fullscreen")}
          onClick={toggleFullscreen}
          icon={isFullscreen ? Minimize : Maximize}
        />
        <MenuButton
          label={`${t("fm.rotate")} (${
            orientation === "landscape" ? t("fm.landscape") : t("fm.portrait")
          })`}
          onClick={toggleOrientation}
          icon={RotateCw}
          disabled={locked}
        />
        <MenuButton
          label={locked ? t("fm.locked") : t("fm.lock")}
          onClick={() => setLocked((l) => !l)}
          icon={locked ? Lock : LockOpen}
          active={locked}
        />
      </div>

      {/* toggle */}
      <button
        aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex size-11 items-center justify-center rounded-full border backdrop-blur-md transition-all",
          open
            ? "border-panel-border-strong bg-control-active text-control-active-foreground"
            : "border-white/10 bg-black/40 text-white/55 hover:bg-black/60 hover:text-white",
        )}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
    </div>
  )
}

function MenuButton({
  label,
  icon: Icon,
  onClick,
  active,
  disabled,
}: {
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  active?: boolean
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group flex items-center gap-2.5 rounded-full border border-white/10 bg-black/50 py-2 pl-3 pr-3.5 backdrop-blur-md transition-all",
        "hover:bg-black/70",
        active && "border-panel-border-strong bg-white/10",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      <span className="whitespace-nowrap font-mono text-[11px] lowercase text-white/70 group-hover:text-white">
        {label}
      </span>
      <Icon className="size-4 text-white/70 group-hover:text-white" />
    </button>
  )
}
