import type { ResolvedInsert, SceneComponent } from "@screenkit/core"
import { GENERATED_INSERT_PACKAGES } from "./generated-inserts"

const PACKAGES = GENERATED_INSERT_PACKAGES

const byPriority = (a: (typeof PACKAGES)[number], b: (typeof PACKAGES)[number]) =>
  (b.manifest.priority ?? 0) - (a.manifest.priority ?? 0)

/**
 * Resolve which scene renders a given insert.
 * Matching order (strongest first):
 *   1. a package whose `inserts` includes this insert.id
 *   2. a package whose `categories` includes insert.category
 *   3. the package marked `fallback`
 * Ties at the same level are broken by `priority` (higher wins).
 */
export function resolveScene(insert: ResolvedInsert): SceneComponent {
  const matches = [...PACKAGES].sort(byPriority)

  const byId = matches.find((p) => p.manifest.inserts?.includes(insert.id))
  if (byId) return byId.Scene

  const byCategory = matches.find((p) =>
    p.manifest.categories?.includes(insert.category),
  )
  if (byCategory) return byCategory.Scene

  const fallback = matches.find((p) => p.manifest.fallback)
  if (fallback) return fallback.Scene

  // last resort: render nothing rather than crash
  return matches[0]?.Scene ?? (() => null)
}

/** all registered scene manifests (for tooling / listings) */
export const sceneManifests = PACKAGES.map((p) => p.manifest)
