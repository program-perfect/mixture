"use client"

import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { PROJECT_VERSION } from "@/lib/screenkit/data"
import { ScreenkitProvider, useScreenkit } from "./store"
import { Rail } from "./rail"
import { Sidebar } from "./sidebar"
import { Content } from "./content"

function MobileTopBar() {
  const { setMobileNavOpen } = useScreenkit()
  return (
    <header className="flex items-center justify-between border-b border-sidebar-border bg-sidebar px-4 py-3 md:hidden">
      <button
        onClick={() => setMobileNavOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-panel-border bg-panel-soft px-3 py-2 font-mono text-sm lowercase text-foreground"
        aria-label="open menu"
      >
        <Menu className="size-4" />
        menu
      </button>
      <span className="font-mono text-xs lowercase text-text-faint">
        {PROJECT_VERSION}
      </span>
    </header>
  )
}

function MobileNav() {
  const { mobileNavOpen, setMobileNavOpen } = useScreenkit()
  return (
    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
      <SheetContent
        side="left"
        className="w-[88vw] max-w-[420px] border-sidebar-border bg-background p-0"
      >
        <SheetTitle className="sr-only">navigation</SheetTitle>
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
    <div className="flex h-[100dvh] flex-col bg-background text-foreground">
      <MobileTopBar />
      <MobileNav />
      <div className="flex min-h-0 flex-1">
        {/* desktop two-level nav */}
        <div className="hidden md:block">
          <Rail />
        </div>
        <div className="hidden border-r border-sidebar-border md:block">
          <Sidebar />
        </div>
        <main className="min-w-0 flex-1">
          <Content />
        </main>
      </div>
    </div>
  )
}

export function AppShell() {
  return (
    <ScreenkitProvider>
      <ShellInner />
    </ScreenkitProvider>
  )
}
