"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/lib/db"
import { screenkitCategories, screenkitInserts } from "@/lib/db/schema"
import { fetchLibrary } from "@/lib/screenkit/library.server"
import { DEFAULT_CATEGORY_DEFS, INSERTS } from "@/lib/screenkit/data"
import type { CategoryDef, Insert } from "@/lib/screenkit/types"

export type LibraryData = { categories: CategoryDef[]; inserts: Insert[] }

const slug = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-я]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "item"

const ACCENT_VARS = [
  "var(--accent-blue)",
  "var(--accent-cyan)",
  "var(--accent-purple)",
  "var(--accent-red)",
  "var(--accent-orange)",
  "var(--accent-green)",
  "var(--accent-grey)",
] as const

const nonEmpty = z.string().trim().min(1)
const optional = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length ? v : null))

const categorySchema = z.object({
  labelRu: nonEmpty.max(40),
  labelEn: optional,
  accent: z.string().trim().optional(),
  tint: z.string().trim().optional(),
})

const insertSchema = z.object({
  category: nonEmpty,
  device: z.enum(["phone", "monitor", "tv", "tablet", "projector", "cctv"]),
  aspect: z.enum(["9:16", "16:9", "4:3", "16:10"]),
  status: z.enum(["draft", "ready", "needs review", "shooting"]),
  episode: nonEmpty.max(24),
  scene: nonEmpty.max(24),
  date: nonEmpty.max(24),
  titleRu: nonEmpty.max(120),
  titleEn: optional,
  descriptionRu: z.string().trim().max(400).optional().default(""),
  descriptionEn: optional,
  promptRu: z.string().trim().max(2000).optional().default(""),
  promptEn: optional,
  shortPromptRu: z.string().trim().max(400).optional().default(""),
  shortPromptEn: optional,
  negativePromptRu: z.string().trim().max(800).optional().default(""),
  negativePromptEn: optional,
  technicalNotesRu: z.array(z.string().trim()).optional().default([]),
  technicalNotesEn: z.array(z.string().trim()).optional(),
})

async function uniqueId(base: string, taken: Set<string>): Promise<string> {
  let id = base
  let n = 2
  while (taken.has(id)) {
    id = `${base}-${n}`
    n += 1
  }
  return id
}

export async function getLibraryAction(): Promise<LibraryData> {
  return fetchLibrary()
}

export async function addCategoryAction(
  input: z.input<typeof categorySchema>,
): Promise<LibraryData> {
  const data = categorySchema.parse(input)

  const existing = await db.select().from(screenkitCategories)
  const taken = new Set<string>([
    ...DEFAULT_CATEGORY_DEFS.map((c) => String(c.id)),
    ...existing.map((c) => c.id),
  ])
  const id = await uniqueId(slug(data.labelEn ?? data.labelRu), taken)
  const accent =
    data.accent && data.accent.length
      ? data.accent
      : ACCENT_VARS[taken.size % ACCENT_VARS.length]

  await db.insert(screenkitCategories).values({
    id,
    accentVar: accent,
    tint: data.tint && data.tint.length ? data.tint : "rgba(255,255,255,0.06)",
    labelRu: data.labelRu,
    labelEn: data.labelEn,
  })

  revalidatePath("/")
  return fetchLibrary()
}

export async function addInsertAction(
  input: z.input<typeof insertSchema>,
): Promise<LibraryData> {
  const data = insertSchema.parse(input)

  const existing = await db.select().from(screenkitInserts)
  const taken = new Set<string>([
    ...INSERTS.map((i) => i.id),
    ...existing.map((i) => i.id),
  ])
  const id = await uniqueId(slug(data.titleEn ?? data.titleRu), taken)

  await db.insert(screenkitInserts).values({
    id,
    date: data.date,
    episode: data.episode,
    scene: data.scene,
    category: data.category,
    device: data.device,
    aspect: data.aspect,
    status: data.status,
    titleRu: data.titleRu,
    titleEn: data.titleEn,
    descriptionRu: data.descriptionRu ?? "",
    descriptionEn: data.descriptionEn,
    promptRu: data.promptRu ?? "",
    promptEn: data.promptEn,
    shortPromptRu: data.shortPromptRu ?? "",
    shortPromptEn: data.shortPromptEn,
    negativePromptRu: data.negativePromptRu ?? "",
    negativePromptEn: data.negativePromptEn,
    technicalNotesRu: data.technicalNotesRu ?? [],
    technicalNotesEn: data.technicalNotesEn ?? null,
  })

  revalidatePath("/")
  return fetchLibrary()
}

export async function resetLibraryAction(): Promise<LibraryData> {
  await db.delete(screenkitInserts)
  await db.delete(screenkitCategories)
  revalidatePath("/")
  return fetchLibrary()
}
