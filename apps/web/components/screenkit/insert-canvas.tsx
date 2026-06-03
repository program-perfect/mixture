"use client"

import type { ResolvedInsert } from "@/lib/screenkit/types"
import { resolveScene } from "@/lib/screenkit/insert-registry"

/**
 * Renders the "screen content" of a prop insert by resolving it to one of the
 * workspace insert-scene packages (packages/inserts/*). The actual scenes live
 * in their own packages; this just picks the right one and renders it.
 */
export function InsertCanvas({ insert }: { insert: ResolvedInsert }) {
  const Scene = resolveScene(insert)
  return <Scene insert={insert} />
}
