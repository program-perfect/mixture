import { notFound } from "next/navigation"
import { fetchLibrary } from "@/lib/screenkit/library.server"
import { ScreenState } from "@/components/screenkit/screen-state"

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
