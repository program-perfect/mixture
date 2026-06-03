"use client"

import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { PROJECT_VERSION } from "@/lib/screenkit/data"
import type { CategoryDef, Insert } from "@/lib/screenkit/types"
import { ScreenkitProvider, useScreenkit } from "./store"
import { Rail } from "./rail"
import { CategoryPanel } from "./category-panel"
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
          <CategoryPanel onNavigate={() => setMobileNavOpen(false)} />
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
        {/* desktop icon rail */}
        <div className="hidden md:block">
          <Rail />
        </div>
        {/* main area — flush to the rail on the left, no surrounding margins.
            categories now live inside it (see Content). */}
        <main className="min-w-0 flex-1 overflow-hidden border-l border-panel-border bg-background">
          <Content />
        </main>
      </div>
    </div>
  )
}

export function AppShell({
  initialInserts,
  initialCategories,
  initialSelectedId,
  initialView,
  initialCategory,
}: {
  initialInserts?: Insert[]
  initialCategories?: CategoryDef[]
  initialSelectedId?: string
  initialView?: string
  initialCategory?: string
}) {
  return (
    <ScreenkitProvider
      initialInserts={initialInserts}
      initialCategories={initialCategories}
      initialSelectedId={initialSelectedId}
      initialView={initialView}
      initialCategory={initialCategory}
    >
      <ShellInner />
    </ScreenkitProvider>
  )
}
