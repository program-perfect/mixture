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
    <div className="flex h-full min-h-0 min-w-0">
      {/* 
        Категории:
        - mobile/tablet/pre-desktop: горизонтальные чипы сверху
        - desktop и шире: боковая панель
      */}
      <CategoryPanel className="hidden lg:flex" />

      <ScrollArea className="h-full min-w-0 flex-1 sk-scroll">
        <div className="mx-auto w-full max-w-[min(100%,44rem)] px-4 py-5 sm:px-6 sm:py-6 md:max-w-[min(100%,52rem)] md:px-8 lg:max-w-[min(100%,58rem)] lg:px-8 lg:py-10 xl:max-w-[min(100%,64rem)] 2xl:max-w-[min(100%,72rem)] 2xl:px-12 2xl:py-14">
          {/* mobile / tablet / pre-desktop */}
          <CategoryChips className="mb-5 sm:mb-6 lg:hidden" />

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
