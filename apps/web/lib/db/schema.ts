import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core"

/* global, shared insert-library tables (no per-user scoping by design) */

export const screenkitCategories = pgTable("screenkit_categories", {
  id: text("id").primaryKey(),
  accentVar: text("accent_var").notNull(),
  tint: text("tint").notNull(),
  icon: text("icon"),
  labelRu: text("label_ru").notNull(),
  labelEn: text("label_en"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const screenkitInserts = pgTable("screenkit_inserts", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  episode: text("episode").notNull(),
  scene: text("scene").notNull(),
  category: text("category").notNull(),
  device: text("device").notNull(),
  aspect: text("aspect").notNull(),
  status: text("status").notNull(),
  titleRu: text("title_ru").notNull(),
  titleEn: text("title_en"),
  descriptionRu: text("description_ru").notNull().default(""),
  descriptionEn: text("description_en"),
  promptRu: text("prompt_ru").notNull().default(""),
  promptEn: text("prompt_en"),
  shortPromptRu: text("short_prompt_ru").notNull().default(""),
  shortPromptEn: text("short_prompt_en"),
  negativePromptRu: text("negative_prompt_ru").notNull().default(""),
  negativePromptEn: text("negative_prompt_en"),
  technicalNotesRu: jsonb("technical_notes_ru").notNull().default([]),
  technicalNotesEn: jsonb("technical_notes_en"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})
