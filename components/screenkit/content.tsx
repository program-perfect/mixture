"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { useScreenkit } from "./store"
import { OverviewSection } from "./sections/overview"
import { LibrarySection } from "./sections/library"
import { PreviewSection } from "./sections/preview"
import { TimelineSection } from "./sections/timeline"
import { PromptsSection } from "./sections/prompts"
import { ExportSection } from "./sections/export"
import { StyleSection } from "./sections/style"
import { AboutSection } from "./sections/about"

export function Content() {
  const { section } = useScreenkit()

  return (
    <ScrollArea className="h-full flex-1 sk-scroll">
      <div className="mx-auto w-full max-w-[820px] px-5 py-8 sm:px-8 lg:py-12 2xl:max-w-[960px] 2xl:px-12 2xl:py-16">
        {section === "overview" && <OverviewSection />}
        {section === "library" && <LibrarySection />}
        {section === "preview" && <PreviewSection />}
        {section === "timeline" && <TimelineSection />}
        {section === "prompts" && <PromptsSection />}
        {section === "export" && <ExportSection />}
        {section === "style" && <StyleSection />}
        {section === "about" && <AboutSection />}
      </div>
    </ScrollArea>
  )
}
