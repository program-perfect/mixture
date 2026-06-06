import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, "../../..")
const webRoot = path.resolve(__dirname, "..")
const insertsRoot = path.join(repoRoot, "packages", "inserts")
const generatedFile = path.join(webRoot, "lib", "screenkit", "generated-inserts.ts")
const publicInsertsRoot = path.join(webRoot, "public", "screenkit-inserts")

const toIdentifier = (name) =>
  name
    .replace(/^insert-/, "")
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, ch) => ch.toUpperCase())
    .replace(/^[^a-zA-Z_$]+/, "_") || "insertPackage"

const title = (slug) =>
  slug
    .replace(/^insert-/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase())

const readJson = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"))
  } catch {
    return null
  }
}

const hasFile = (dir, name) => fs.existsSync(path.join(dir, name))
const toPosix = (value) => value.split(path.sep).join(path.posix.sep)
const sourceDirFor = (dir) => toPosix(path.relative(repoRoot, dir))
const importPathFor = (file) => {
  const relative = toPosix(path.relative(path.dirname(generatedFile), file))
  return relative.startsWith(".") ? relative : `./${relative}`
}
const publicSlugFor = (category, slug) => (category ? `${category}/${slug}` : slug)
const packageKeyFor = (category, slug) => (category ? `${category}-${slug}` : slug)
const safeIdSlug = (value) => value.replaceAll("/", "-")

const isNativeInsert = (dir) => hasFile(dir, "src/index.tsx") || hasFile(dir, "src/index.ts")
const nativeEntryFile = (dir) => path.join(dir, hasFile(dir, "src/index.tsx") ? "src/index" : "src/index")
const looksLikeNextProject = (dir, pkg) =>
  hasFile(dir, "next.config.js") ||
  hasFile(dir, "next.config.mjs") ||
  Boolean(pkg?.dependencies?.next || pkg?.devDependencies?.next)

const isInsertDirectory = (dir) => {
  const pkg = readJson(path.join(dir, "package.json"))
  return Boolean(
    pkg ||
      hasFile(dir, "screenkit.insert.json") ||
      isNativeInsert(dir) ||
      looksLikeNextProject(dir, pkg),
  )
}

const collectInsertDirectories = () => {
  const entries = []
  if (!fs.existsSync(insertsRoot)) return entries

  for (const dirent of fs.readdirSync(insertsRoot, { withFileTypes: true })) {
    if (!dirent.isDirectory()) continue

    const topSlug = dirent.name
    const topDir = path.join(insertsRoot, topSlug)

    // Backward compatibility: the old flat layout still works:
    // packages/inserts/<insert>/...
    if (isInsertDirectory(topDir)) {
      entries.push({ category: null, slug: topSlug, dir: topDir })
    }

    // New layout: packages/inserts/<category>/<insert>/...
    for (const child of fs.readdirSync(topDir, { withFileTypes: true })) {
      if (!child.isDirectory()) continue
      const insertDir = path.join(topDir, child.name)
      if (!isInsertDirectory(insertDir)) continue
      entries.push({ category: topSlug, slug: child.name, dir: insertDir })
    }
  }

  return entries.sort((a, b) =>
    publicSlugFor(a.category, a.slug).localeCompare(publicSlugFor(b.category, b.slug)),
  )
}

if (!fs.existsSync(insertsRoot)) fs.mkdirSync(insertsRoot, { recursive: true })
fs.rmSync(publicInsertsRoot, { recursive: true, force: true })
fs.mkdirSync(publicInsertsRoot, { recursive: true })

const packageImports = []
const packageRefs = []
const nextProjects = []
const categoryDefs = []
const categoryDefIds = new Set()
const insertDefs = []

const pushCategoryDef = (auto) => {
  if (!auto.categoryDef) return
  const id = auto.categoryDef.id
  if (id && categoryDefIds.has(id)) return
  if (id) categoryDefIds.add(id)
  categoryDefs.push(JSON.stringify(auto.categoryDef, null, 2))
}

const insertDefFrom = ({ auto, category, slug, publicSlug, isNext }) => {
  const insertId = auto.id ?? `auto-${safeIdSlug(publicSlug)}`
  const categoryId = auto.category ?? category ?? "phones"
  const labelRu = auto.label?.ru ?? auto.title?.ru ?? title(slug)
  const labelEn = auto.label?.en ?? auto.title?.en ?? title(slug)
  const sourceDir = category ? `packages/inserts/${category}/${slug}` : `packages/inserts/${slug}`
  const sourceLabelRu = category
    ? `${category}/${slug}`
    : slug
  const sourceLabelEn = sourceLabelRu

  return JSON.stringify({
    id: insertId,
    date: auto.date ?? "2026-01-01",
    episode: auto.episode ?? "auto",
    scene: auto.scene ?? publicSlug,
    category: categoryId,
    device: auto.device ?? "phone",
    aspect: auto.aspect ?? "9:16",
    status: auto.status ?? "draft",
    title: { ru: labelRu, en: labelEn },
    description: {
      ru:
        auto.description?.ru ??
        `автоматически подключённая экранная вставка: ${sourceLabelRu}`,
      en:
        auto.description?.en ??
        `auto-linked screen insert: ${sourceLabelEn}`,
    },
    prompt: {
      ru: auto.prompt?.ru ?? `экранная вставка ${sourceLabelRu}`,
      en: auto.prompt?.en ?? `screen insert ${sourceLabelEn}`,
    },
    shortPrompt: {
      ru: auto.shortPrompt?.ru ?? labelRu,
      en: auto.shortPrompt?.en ?? labelEn,
    },
    negativePrompt: {
      ru: auto.negativePrompt?.ru ?? "",
      en: auto.negativePrompt?.en ?? "",
    },
    technicalNotes: {
      ru:
        auto.technicalNotes?.ru ??
        [
          isNext
            ? `Next.js-проект подключён автоматически из ${sourceDir}`
            : `нативная вставка подключена автоматически из ${sourceDir}`,
        ],
      en:
        auto.technicalNotes?.en ??
        [
          isNext
            ? `Next.js project auto-linked from ${sourceDir}`
            : `native insert auto-linked from ${sourceDir}`,
        ],
    },
  }, null, 2)
}

for (const entry of collectInsertDirectories()) {
  const { category, slug, dir } = entry
  const pkg = readJson(path.join(dir, "package.json"))
  const auto = readJson(path.join(dir, "screenkit.insert.json")) ?? {}
  const native = isNativeInsert(dir)
  const next = looksLikeNextProject(dir, pkg)
  const publicSlug = publicSlugFor(category, slug)
  const packageKey = packageKeyFor(category, slug)

  pushCategoryDef(auto)

  if (native && pkg?.name?.startsWith("@screenkit/insert-")) {
    const id = toIdentifier(packageKey)
    packageImports.push(`import * as ${id} from ${JSON.stringify(importPathFor(nativeEntryFile(dir)))}`)
    packageRefs.push(id)

    // Native inserts can also describe their library card with
    // screenkit.insert.json. Existing built-in cards remain in data.ts unless a
    // package opts in by providing an id.
    if (auto.id) {
      insertDefs.push(insertDefFrom({ auto, category, slug, publicSlug, isNext: false }))
    }
    continue
  }

  if (!next) continue

  const outDir = path.join(dir, "out")
  const publicDir = path.join(publicInsertsRoot, publicSlug)
  const hasStaticOutput = fs.existsSync(path.join(outDir, "index.html"))

  if (hasStaticOutput) {
    fs.mkdirSync(path.dirname(publicDir), { recursive: true })
    fs.cpSync(outDir, publicDir, { recursive: true })
  }

  const insertId = auto.id ?? `auto-${safeIdSlug(publicSlug)}`
  const labelRu = auto.label?.ru ?? auto.title?.ru ?? title(slug)
  const labelEn = auto.label?.en ?? auto.title?.en ?? title(slug)
  const manifestLabel = auto.manifestLabel ?? labelEn

  nextProjects.push(`makeNextProjectInsertPackage({
    slug: ${JSON.stringify(publicSlug)},
    entry: ${JSON.stringify(`/screenkit-inserts/${publicSlug}/index.html`)},
    sourceDir: ${JSON.stringify(sourceDirFor(dir))},
    hasStaticOutput: ${hasStaticOutput},
    manifest: {
      key: ${JSON.stringify(`next-${safeIdSlug(publicSlug)}`)},
      label: ${JSON.stringify(manifestLabel)},
      inserts: [${JSON.stringify(insertId)}],
      priority: ${Number(auto.priority ?? 50)},
    },
  })`)

  insertDefs.push(insertDefFrom({ auto, category, slug, publicSlug, isNext: true }))
}

const content = `import type { CategoryDef, Insert } from "./types"
import type { InsertPackage } from "@screenkit/core"
import { makeNextProjectInsertPackage } from "./next-project-scene"

${packageImports.join("\n")}

// AUTO-GENERATED BY apps/web/scripts/sync-inserts.mjs
// New layout: packages/inserts/<category>/<insert>/
// Legacy layout packages/inserts/<insert>/ is still supported while old inserts are migrated.
// Then run pnpm --filter web sync-inserts.

export const GENERATED_NEXT_PROJECT_PACKAGES: InsertPackage[] = [
  ${nextProjects.join(",\n  ")}
]

export const GENERATED_INSERT_PACKAGES: InsertPackage[] = [
  ${packageRefs.join(",\n  ")}${packageRefs.length ? "," : ""}
  ...GENERATED_NEXT_PROJECT_PACKAGES,
]

export const GENERATED_INSERT_CATEGORIES: CategoryDef[] = [
  ${categoryDefs.join(",\n  ")}
]

export const GENERATED_INSERTS: Insert[] = [
  ${insertDefs.join(",\n  ")}
]
`

fs.mkdirSync(path.dirname(generatedFile), { recursive: true })
fs.writeFileSync(generatedFile, content)
console.log(`[screenkit] synced ${packageRefs.length} native inserts, ${nextProjects.length} next inserts`)
