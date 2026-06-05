import type { ComponentType } from "react"
import type { CategoryId, ResolvedInsert } from "./types"

/* the props every insert scene component receives */
export type SceneProps = {
  insert: ResolvedInsert
  /** optional preview/runtime controls supplied by the host app */
  settings?: Record<string, unknown>
}

export type SceneComponent = ComponentType<SceneProps>

/**
 * A scene package describes itself with a manifest. The registry in the app
 * reads these to resolve an insert -> scene without a central switch.
 *
 * Matching priority (highest first):
 *   1. `inserts` contains insert.id
 *   2. `categories` contains insert.category
 *   3. `fallback: true` (the default scene when nothing else matches)
 * `priority` breaks ties when multiple manifests match at the same level.
 */
export type InsertSceneManifest = {
  /** stable unique scene key, e.g. "cctv", "messenger" */
  key: string
  /** human-readable label for tooling/registry listings */
  label: string
  /** specific insert ids this scene claims (strongest match) */
  inserts?: string[]
  /** categories this scene renders by default */
  categories?: CategoryId[]
  /** marks this scene as the catch-all when nothing else matches */
  fallback?: boolean
  /** higher wins when several manifests match at the same level */
  priority?: number
}

/* the public shape every insert package must export */
export type InsertPackage = {
  manifest: InsertSceneManifest
  Scene: SceneComponent
}
