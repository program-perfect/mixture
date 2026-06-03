import { AppShell } from "@/components/screenkit/app-shell"
import { fetchLibrary } from "@/lib/screenkit/library.server"

export const dynamic = "force-dynamic"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ insert?: string }>
}) {
  const { inserts, categories } = await fetchLibrary()
  const { insert } = await searchParams
  return (
    <AppShell
      initialInserts={inserts}
      initialCategories={categories}
      initialSelectedId={insert}
    />
  )
}
