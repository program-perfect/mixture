"use client"

import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useScreenkit, type Section } from "./store"
import { useReveal } from "./motion"
import { CategoryPanel, CategoryChips } from "./category-panel"
import { OverviewSection } from "./sections/overview"
import { LibrarySection } from "./sections/library"
import { PreviewSection } from "./sections/preview"
import { TimelineSection } from "./sections/timeline"
import { PromptsSection } from "./sections/prompts"
import { StyleSection } from "./sections/style"
import { AboutSection } from "./sections/about"
import {
  OverviewSkeleton,
  LibrarySkeleton,
  PreviewSkeleton,
  TimelineSkeleton,
  PromptsSkeleton,
  StyleSkeleton,
  AboutSkeleton,
} from "./skeletons"

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
    <div className="flex h-full min-h-0">
      {/* category navigation lives inside the main area — list on md+ */}
      <CategoryPanel className="hidden md:flex" />

      <ScrollArea className="h-full min-w-0 flex-1 sk-scroll">
        <div className="mx-auto w-full max-w-[820px] px-5 py-6 sm:px-8 lg:py-10 2xl:max-w-[980px] 2xl:px-12 2xl:py-14">
          {/* mobile / pre-tablet: categories as a horizontal chip strip */}
          <CategoryChips className="mb-6 md:hidden" />

          {/* keyed by section so each navigation remounts -> instant transition,
              a brief skeleton, then a smooth enter animation of the real content */}
          <SectionView key={section} section={section} />
        </div>
      </ScrollArea>
    </div>
  )
}

function SectionView({ section }: { section: Section }) {
  const phase = useReveal()

  if (phase === "skeleton") {
    return <>{SECTION_SKELETON[section]}</>
  }

  return <div className="sk-section-enter">{SECTION_CONTENT[section]}</div>
}
