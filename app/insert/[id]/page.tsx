import { notFound } from "next/navigation"
import { INSERTS, getInsert } from "@/lib/screenkit/data"
import { ScreenState } from "@/components/screenkit/screen-state"

export function generateStaticParams() {
  return INSERTS.map((i) => ({ id: i.id }))
}

export default async function InsertScreenStatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const insert = getInsert(id)
  if (!insert) notFound()
  return <ScreenState insert={insert} />
}
