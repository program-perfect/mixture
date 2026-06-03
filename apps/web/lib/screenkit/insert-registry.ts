import type {
  InsertPackage,
  ResolvedInsert,
  SceneComponent,
} from "@screenkit/core"

import * as bank from "@screenkit/insert-bank"
import * as call from "@screenkit/insert-call"
import * as cctv from "@screenkit/insert-cctv"
import * as countdown from "@screenkit/insert-countdown"
import * as dyingVideo from "@screenkit/insert-dying-video"
import * as messenger from "@screenkit/insert-messenger"
import * as remote from "@screenkit/insert-remote"
import * as situation from "@screenkit/insert-situation"
import * as textFile from "@screenkit/insert-text-file"
import * as tracker from "@screenkit/insert-tracker"
import * as tvNews from "@screenkit/insert-tv-news"
import * as wanted from "@screenkit/insert-wanted"

/**
 * Every insert scene is its own workspace package that self-describes via a
 * manifest. To add a new insert scene: create a package under
 * packages/inserts/*, export `{ manifest, Scene }`, add it as a dependency of
 * the web app, then register it in this list. No central switch to edit.
 */
const PACKAGES: InsertPackage[] = [
  bank,
  call,
  cctv,
  countdown,
  dyingVideo,
  messenger,
  remote,
  situation,
  textFile,
  tracker,
  tvNews,
  wanted,
]

const byPriority = (a: InsertPackage, b: InsertPackage) =>
  (b.manifest.priority ?? 0) - (a.manifest.priority ?? 0)

/**
 * Resolve which scene renders a given insert.
 * Matching order (strongest first):
 *   1. a package whose `inserts` includes this insert.id
 *   2. a package whose `categories` includes this insert.category
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
  return situation.Scene
}

/** all registered scene manifests (for tooling / listings) */
export const sceneManifests = PACKAGES.map((p) => p.manifest)
