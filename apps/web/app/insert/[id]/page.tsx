import { ScreenState } from "@/components/screenkit/screen-state"
import { fetchLibrary } from "@/lib/screenkit/library.server"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function InsertScreenStatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { inserts } = await fetchLibrary()
  const insert = inserts.find((i) => i.id === id)
  if (!insert) notFound()
  return <ScreenState insert={insert} />
}
