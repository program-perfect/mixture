"use client"

import Link from "next/link"
import { ArrowLeft, SearchX } from "lucide-react"
import { Explain, SectionHeading } from "../primitives"

export function NotFoundSection() {
  return (
    <div className="flex min-h-[62vh] min-w-0 items-center">
      <div className="relative w-full overflow-hidden rounded-[2rem] border border-panel-border bg-panel-soft p-6 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.75)] sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-[radial-gradient(circle,rgba(47,128,237,0.22),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 size-72 rounded-full bg-[radial-gradient(circle,rgba(255,159,28,0.16),transparent_66%)]" />

        <div className="relative flex max-w-2xl flex-col gap-5">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-panel-border bg-control text-text-secondary">
            <SearchX className="size-7" strokeWidth={1.6} />
          </div>
          <div className="flex flex-col gap-3">
            <div className="font-mono text-[12px] uppercase tracking-[0.34em] text-text-faint">
              404 / route not found
            </div>
            <SectionHeading title="страница не найдена" className="text-3xl sm:text-4xl" />
            <Explain className="max-w-2xl">
              такого адреса в screenkit нет. вернитесь на главную страницу библиотеки вставок или выберите нужный раздел в левой панели.
            </Explain>
          </div>
          <Link
            href="/"
            className="inline-flex w-fit items-center justify-center gap-2 rounded-2xl bg-control-active px-4 py-3 font-mono text-sm lowercase text-control-active-foreground transition-opacity hover:opacity-90"
          >
            <ArrowLeft className="size-4" />
            на главную
          </Link>
        </div>
      </div>
    </div>
  )
}
