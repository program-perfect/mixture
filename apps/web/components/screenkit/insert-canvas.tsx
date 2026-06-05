"use client"

import { resolveScene } from "@/lib/screenkit/insert-registry"
import type { ResolvedInsert } from "@/lib/screenkit/types"
import type { PreviewSettings } from "./store"

/**
 * Renders the "screen content" of a prop insert by resolving it to one of the
 * workspace insert-scene packages (packages/inserts/*). The actual scenes live
 * in their own packages; this just picks the right one and renders it.
 */
export function InsertCanvas({
  insert,
  settings,
}: {
  insert: ResolvedInsert
  settings?: PreviewSettings
}) {
  const Scene = resolveScene(insert)
  return <Scene insert={insert} settings={settings as unknown as Record<string, unknown>} />
}
