"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import * as React from "react"
import { CategoryChips, CategoryPanel } from "./category-panel"
import { useReveal } from "./motion"
import { AboutSection } from "./sections/about"
import { LibrarySection } from "./sections/library"
import { OverviewSection } from "./sections/overview"
import { PreviewSection } from "./sections/preview"
import { PromptsSection } from "./sections/prompts"
import { StyleSection } from "./sections/style"
import { TimelineSection } from "./sections/timeline"
import {
  AboutSkeleton,
  LibrarySkeleton,
  OverviewSkeleton,
  PreviewSkeleton,
  PromptsSkeleton,
  StyleSkeleton,
  TimelineSkeleton,
} from "./skeletons"
import { useScreenkit, type Section } from "./store"

const SECTION_CONTENT: Record<Section, React.ReactNode> = {
  overview: <OverviewSection />,
  library: <LibrarySection />,
  preview: <PreviewSection />,
  timeline: <TimelineSection />,
  prompts: <PromptsSection />,
  style: <StyleSection />,
  about: <AboutSection />,
}

const SECTION_SKELETON: Record<Section, React.ReactNode> = {
  overview: <OverviewSkeleton />,
  library: <LibrarySkeleton />,
  preview: <PreviewSkeleton />,
  timeline: <TimelineSkeleton />,
  prompts: <PromptsSkeleton />,
  style: <StyleSkeleton />,
  about: <AboutSkeleton />,
}

export function Content() {
  const { section } = useScreenkit()

  return (
    <div className="flex h-full min-h-0 min-w-0 overflow-hidden">
      {/* The side category panel needs enough room to share the main area.
          Keep chips on mobile/tablet/pre-desktop so the panel never consumes
          the whole content column around the narrow desktop breakpoint. */}
      <CategoryPanel className="hidden xl:flex" />

      <ScrollArea className="h-full min-w-0 flex-1 overflow-x-hidden sk-scroll">
        <div className="w-full min-w-0 overflow-x-hidden">
          {/* Chips span the whole available main area: from the category-panel
              edge to the right edge, not only the centered content column. */}
          <CategoryChips className="mb-5 border-b border-panel-border/40 bg-background/95 py-3 backdrop-blur sm:mb-6 xl:hidden" />

          <div className="w-full min-w-0 overflow-x-hidden px-[clamp(1rem,3vw,3rem)] py-[clamp(1.25rem,3vw,3.5rem)]">
            <SectionView key={section} section={section} />
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

function SectionView({ section }: { section: Section }) {
  const phase = useReveal()

  if (phase === "skeleton") {
    return (
      <div className="min-w-0 max-w-full overflow-x-hidden">
        {SECTION_SKELETON[section]}
      </div>
    )
  }

  return (
    <div className="sk-section-enter min-w-0 max-w-full overflow-x-hidden">
      {SECTION_CONTENT[section]}
    </div>
  )
}
