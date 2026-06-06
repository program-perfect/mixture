"use client"

import { Explain } from "../primitives"
import { useScreenkit } from "../store"

export function TimelineSection() {
  const { locale } = useScreenkit()

  return (
    <div className="sk-page-enter flex min-w-0 flex-col gap-4">
      <h1 className="font-mono text-3xl font-black lowercase tracking-tight text-foreground sm:text-4xl">
        {locale === "en" ? "changelog" : "журнал изменений"}
      </h1>
      <Explain>
        {locale === "en"
          ? "The GitHub changelog is being restored."
          : "Журнал изменений восстанавливается."}
      </Explain>
    </div>
  )
}
