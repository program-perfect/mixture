import { AppShell } from "@/components/screenkit/app-shell"
import { fetchLibrary } from "@/lib/screenkit/library.server"

export default async function NotFound() {
  const { inserts, categories } = await fetchLibrary()

  return (
    <AppShell
      initialInserts={inserts}
      initialCategories={categories}
      initialView="library"
      notFound
    />
  )
}
