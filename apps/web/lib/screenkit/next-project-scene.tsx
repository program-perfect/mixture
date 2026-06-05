"use client"

import type { InsertPackage, InsertSceneManifest, SceneProps } from "@screenkit/core"

export type NextProjectInsertConfig = {
  slug: string
  entry: string
  sourceDir: string
  hasStaticOutput: boolean
  manifest: InsertSceneManifest
}

export function makeNextProjectInsertPackage(config: NextProjectInsertConfig): InsertPackage {
  function NextProjectScene({ insert }: SceneProps) {
    return (
      <div className="absolute inset-0 overflow-hidden bg-black text-white">
        {config.hasStaticOutput ? (
          <iframe
            title={config.manifest.label || insert.title}
            src={config.entry}
            className="h-full w-full border-0 bg-black"
            allow="autoplay; fullscreen; picture-in-picture"
          />
        ) : (
          <div className="flex h-full w-full flex-col justify-center gap-4 bg-[radial-gradient(circle_at_50%_0%,#1f2937,#020617_64%)] p-6 font-mono text-white">
            <div className="max-w-md">
              <div className="mb-2 text-[11px] uppercase tracking-[0.28em] text-white/40">
                next insert
              </div>
              <h2 className="text-2xl font-bold lowercase">{config.manifest.label}</h2>
              <p className="mt-3 text-[13px] leading-relaxed text-white/60">
                проект найден автоматически в {config.sourceDir}, но рядом нет статического экспорта <span className="text-white/90">out/</span>.
                собери next-проект с export-выводом, и screenkit подхватит его как iframe-вставку.
              </p>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-[11px] leading-relaxed text-white/55">
                ожидаемый путь: packages/inserts/{config.slug}/out/index.html
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return {
    manifest: config.manifest,
    Scene: NextProjectScene,
  }
}
