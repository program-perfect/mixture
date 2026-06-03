"use client"

import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { PROJECT_VERSION } from "@/lib/screenkit/data"
import type { CategoryDef, Insert } from "@/lib/screenkit/types"
import { ScreenkitProvider, useScreenkit } from "./store"
import { Rail } from "./rail"
import { Sidebar } from "./sidebar"
import { Content } from "./content"

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
        className="w-[88vw] max-w-[420px] border-sidebar-border bg-background p-0"
      >
        <SheetTitle className="sr-only">{t("nav.navigation")}</SheetTitle>
        <div className="flex h-full">
          <Rail onNavigate={() => setMobileNavOpen(false)} />
          <Sidebar onNavigate={() => setMobileNavOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

function ShellInner() {
  return (
    <div className="flex h-[100dvh] flex-col bg-sidebar text-foreground">
      <MobileTopBar />
      <MobileNav />
      <div className="flex min-h-0 flex-1">
        {/* desktop two-level nav — sits underneath the floating content panel */}
        <div className="hidden md:block">
          <Rail />
        </div>
        <div className="hidden md:block">
          <Sidebar />
        </div>
        {/* floating rounded main area */}
        <main className="min-w-0 flex-1 md:py-3 md:pr-3">
          <div className="h-full overflow-hidden border-panel-border bg-background md:rounded-3xl md:border md:shadow-[0_2px_40px_-12px_rgba(0,0,0,0.55)]">
            <Content />
          </div>
        </main>
      </div>
    </div>
  )
}

export function AppShell({
  initialInserts,
  initialCategories,
  initialSelectedId,
}: {
  initialInserts?: Insert[]
  initialCategories?: CategoryDef[]
  initialSelectedId?: string
}) {
  return (
    <ScreenkitProvider
      initialInserts={initialInserts}
      initialCategories={initialCategories}
      initialSelectedId={initialSelectedId}
    >
      <ShellInner />
    </ScreenkitProvider>
  )
}
