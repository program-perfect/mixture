"use client"

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { PROJECT_VERSION } from "@/lib/screenkit/data"
import type { CategoryDef, Insert } from "@/lib/screenkit/types"
import { Menu } from "lucide-react"
import * as React from "react"
import { CategoryPanel } from "./category-panel"
import { Content } from "./content"
import { Rail } from "./rail"
import { ScreenkitProvider, useScreenkit } from "./store"

const LOCALE_FLOW_CSS = `
@keyframes sk-locale-text-flow {
  0% { opacity: .45; filter: blur(2px); transform: translate3d(0, .32em, 0); }
  55% { opacity: .9; filter: blur(.35px); }
  100% { opacity: 1; filter: blur(0); transform: translate3d(0, 0, 0); }
}
html[data-locale-flow="on"][data-motion="full"] :where(h1,h2,h3,h4,p,span,button,label,a,li,dt,dd,th,td,small) {
  animation: sk-locale-text-flow .44s cubic-bezier(.16, 1, .3, 1) both;
}
`

function MobileTopBar() {
  const { setMobileNavOpen, t } = useScreenkit()
  return (
    <header className="flex items-center justify-between border-b border-sidebar-border bg-sidebar px-4 py-3 md:hidden">
      <button
        onClick={() => setMobileNavOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-panel-border bg-panel-soft px-3 py-2 font-mono text-sm lowercase text-foreground"
        aria-label={t("nav.openMenu")}
      >
        <Menu className="size-4" />
        {t("nav.menu")}
      </button>
      <span className="font-mono text-xs lowercase text-text-faint">
        {PROJECT_VERSION}
      </span>
    </header>
  )
}

function MobileNav() {
  const { mobileNavOpen, setMobileNavOpen, t } = useScreenkit()
  return (
    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
      <SheetContent
        side="left"
        className="w-[92vw] max-w-[440px] border-sidebar-border bg-background p-0 sm:w-[420px]"
      >
        <SheetTitle className="sr-only">{t("nav.navigation")}</SheetTitle>
        <div className="flex h-full min-w-0">
          <Rail onNavigate={() => setMobileNavOpen(false)} />
          <CategoryPanel
            className="flex min-w-0 flex-1"
            onNavigate={() => setMobileNavOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}

function LocaleFlowEffect() {
  const { locale } = useScreenkit()
  const previous = React.useRef(locale)

  React.useEffect(() => {
    if (previous.current === locale) return
    previous.current = locale

    const root = document.documentElement
    const canAnimate =
      root.dataset.motion === "full" && root.dataset.motionSections !== "off"

    if (!canAnimate) return

    root.setAttribute("data-locale-flow", "on")
    const id = window.setTimeout(() => {
      root.removeAttribute("data-locale-flow")
    }, 520)

    return () => window.clearTimeout(id)
  }, [locale])

  return null
}

function ShellInner({ notFound = false }: { notFound?: boolean }) {
  return (
    <>
      <style>{LOCALE_FLOW_CSS}</style>
      <div className="flex h-[100dvh] flex-col bg-sidebar text-foreground">
        <LocaleFlowEffect />
        <MobileTopBar />
        <MobileNav />
        <div className="flex min-h-0 flex-1 bg-sidebar">
          {/* desktop icon rail — sits behind the main area; the rounded left
              corners of main reveal the rail color so it appears to tuck under */}
          <div className="hidden md:block">
            <Rail />
          </div>
          {/* main area — no top/bottom/right margins. only the left edge is
              rounded and pulled over the rail so the rail tucks beneath it. */}
          <main className="relative z-10 min-w-0 flex-1 overflow-hidden bg-background md:-ml-3 md:rounded-l-[1.5rem]">
            <Content notFound={notFound} />
          </main>
        </div>
      </div>
    </>
  )
}

export function AppShell({
  initialInserts,
  initialCategories,
  initialSelectedId,
  initialView,
  initialCategory,
  notFound,
}: {
  initialInserts?: Insert[]
  initialCategories?: CategoryDef[]
  initialSelectedId?: string
  initialView?: string
  initialCategory?: string
  notFound?: boolean
}) {
  return (
    <ScreenkitProvider
      initialInserts={initialInserts}
      initialCategories={initialCategories}
      initialSelectedId={initialSelectedId}
      initialView={initialView}
      initialCategory={initialCategory}
    >
      <ShellInner notFound={notFound} />
    </ScreenkitProvider>
  )
}
