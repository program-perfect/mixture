import { AppShell } from "@/components/screenkit/app-shell"
import { fetchLibrary } from "@/lib/screenkit/library.server"

export const dynamic = "force-dynamic"

export default async function Page() {
  const { inserts, categories } = await fetchLibrary()
  return <AppShell initialInserts={inserts} initialCategories={categories} />
}
