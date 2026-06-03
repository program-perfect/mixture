"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Maximize,
  Minimize,
  RotateCw,
  Eye,
  Keyboard,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Locale } from "@/lib/screenkit/types"
import { DEFAULT_LOCALE, translate } from "@/lib/screenkit/i18n"

export type Orientation = "landscape" | "portrait"
export type RevealMode = "exit" | "hotkey"

export function FloatingMenu({
  locale = DEFAULT_LOCALE,
  insertId,
  orientation,
  onOrientationChange,
  isFullscreen,
  onToggleFullscreen,
  revealMode,
  onRevealModeChange,
  className,
}: {
  locale?: Locale
  insertId: string
  orientation: Orientation
  onOrientationChange: (o: Orientation) => void
  isFullscreen: boolean
  onToggleFullscreen: () => void
  revealMode: RevealMode
  onRevealModeChange: (m: RevealMode) => void
  className?: string
}) {
  const router = useRouter()
  const t = (key: string) => translate(locale, key)
  const [open, setOpen] = React.useState(false)

  // back returns to this insert's preview inside the app (not the home root)
  const goBack = React.useCallback(() => {
    router.push(`/?insert=${encodeURIComponent(insertId)}`)
  }, [router, insertId])

  return (
    <div
      className={cn(
        "fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6",
        className,
      )}
    >
      {/* expanded actions */}
      <div
        className={cn(
          "flex flex-col items-end gap-2 transition-all duration-200",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0",
        )}
      >
        <MenuButton label={t("fm.back")} onClick={goBack} icon={ArrowLeft} />
        <MenuButton
          label={isFullscreen ? t("fm.exitFullscreen") : t("fm.fullscreen")}
          onClick={onToggleFullscreen}
          icon={isFullscreen ? Minimize : Maximize}
        />
        <MenuButton
          label={`${t("fm.rotate")} (${
            orientation === "landscape" ? t("fm.landscape") : t("fm.portrait")
          })`}
          onClick={() =>
            onOrientationChange(
              orientation === "landscape" ? "portrait" : "landscape",
            )
          }
          icon={RotateCw}
        />
        {/* reveal-mode setting: how the menu comes back while fullscreen */}
        <MenuButton
          label={
            revealMode === "exit" ? t("fm.revealExit") : t("fm.revealHotkey")
          }
          onClick={() =>
            onRevealModeChange(revealMode === "exit" ? "hotkey" : "exit")
          }
          icon={revealMode === "exit" ? Eye : Keyboard}
          active
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
