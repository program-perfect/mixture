"use client"

import * as React from "react"
import { ChevronDown, ExternalLink, ScrollText } from "lucide-react"
import manifest from "@/lib/screenkit/licenses.generated.json"
import { SectionHeading, Explain } from "./primitives"
import { useScreenkit } from "./store"

type Pkg = {
  name: string
  version: string
  declared: string
  license: string
  author: string | null
  repository: string | null
  homepage: string | null
  licenseFile: string | null
  hasText: boolean
}

const PACKAGES = (manifest.packages as Pkg[]) ?? []

function LicenseRow({ pkg }: { pkg: Pkg }) {
  const { t } = useScreenkit()
  const [open, setOpen] = React.useState(false)
  const [text, setText] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  async function toggle() {
    const next = !open
    setOpen(next)
    if (next && text === null && pkg.licenseFile) {
      setLoading(true)
      try {
        const res = await fetch(`/licenses/${pkg.licenseFile}`)
        setText(res.ok ? await res.text() : t("licenses.unavailable"))
      } catch {
        setText(t("licenses.unavailable"))
      } finally {
        setLoading(false)
      }
    }
  }

  const link = pkg.repository || pkg.homepage

  return (
    <div className="border-b border-panel-border/60 last:border-0">
      <div className="flex items-center justify-between gap-3 py-2.5">
        <button
          onClick={toggle}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          disabled={!pkg.hasText}
        >
          {pkg.hasText ? (
            <ChevronDown
              className={`size-3.5 shrink-0 text-text-muted transition-transform ${open ? "rotate-180" : ""}`}
            />
          ) : (
            <ScrollText className="size-3.5 shrink-0 text-text-faint" />
          )}
          <span className="truncate font-mono text-sm text-foreground">
            {pkg.name}
          </span>
          <span className="shrink-0 font-mono text-[11px] text-text-faint">
            {pkg.version}
          </span>
        </button>
        <div className="flex shrink-0 items-center gap-3">
          <span className="rounded-md bg-control px-2 py-0.5 font-mono text-[11px] lowercase text-text-secondary">
            {pkg.license}
          </span>
          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noreferrer noopener"
              className="text-text-muted transition-colors hover:text-foreground"
              aria-label={`${pkg.name} — repository`}
            >
              <ExternalLink className="size-3.5" />
            </a>
          ) : null}
        </div>
      </div>
      {open ? (
        <div className="pb-3 pl-6">
          {pkg.author ? (
            <p className="mb-2 font-mono text-[11px] text-text-muted">
              {pkg.author}
            </p>
          ) : null}
          {loading ? (
            <p className="font-mono text-[11px] text-text-faint">
              {t("licenses.loading")}
            </p>
          ) : (
            <pre className="sk-scroll max-h-64 overflow-auto whitespace-pre-wrap rounded-xl border border-panel-border bg-background/60 p-3 font-mono text-[11px] leading-relaxed text-text-secondary">
              {text}
            </pre>
          )}
        </div>
      ) : null}
    </div>
  )
}

export function LicensesList() {
  const { t } = useScreenkit()
  const [query, setQuery] = React.useState("")

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return PACKAGES
    return PACKAGES.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.license.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading title={t("licenses.title")} />
      <Explain>{t("licenses.desc")}</Explain>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("licenses.search")}
        className="h-10 w-full rounded-xl border border-panel-border bg-control px-3 font-mono text-sm text-foreground placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-ring"
      />

      <div className="flex items-center justify-between font-mono text-[11px] text-text-faint">
        <span>
          {filtered.length} / {PACKAGES.length} {t("licenses.packages")}
        </span>
        <span>{t("licenses.directDeps")}</span>
      </div>

      <div className="flex flex-col rounded-2xl border border-panel-border bg-panel-soft px-4">
        {filtered.map((pkg) => (
          <LicenseRow key={pkg.name} pkg={pkg} />
        ))}
        {filtered.length === 0 ? (
          <p className="py-6 text-center font-mono text-xs text-text-muted">
            {t("licenses.empty")}
          </p>
        ) : null}
      </div>
    </div>
  )
}
