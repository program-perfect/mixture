/**
 * collect-licenses.mjs
 *
 * Walks the project's *direct* dependencies (dependencies + devDependencies in
 * package.json), reads each installed package's metadata + license text from
 * node_modules, copies the raw license files into ./licenses/, and writes a
 * machine-readable manifest to lib/screenkit/licenses.generated.json.
 *
 * Wired into `predev` and `prebuild`, so the data is refreshed whenever the app
 * is started in dev mode or built — including any newly installed modules.
 */
import { promises as fs } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
// In the monorepo, Bun hoists most dependencies to the repo-root node_modules.
// Resolve packages by checking the app-local node_modules first, then walking
// up to the workspace root, so license collection works either way.
const NODE_MODULES_CANDIDATES = [
  path.join(ROOT, "node_modules"),
  path.resolve(ROOT, "..", "..", "node_modules"),
]

async function resolvePkgDir(name) {
  const segs = name.split("/")
  for (const nm of NODE_MODULES_CANDIDATES) {
    const dir = path.join(nm, ...segs)
    try {
      await fs.access(path.join(dir, "package.json"))
      return dir
    } catch {
      // try next candidate
    }
  }
  // default to app-local path so downstream reads fail gracefully
  return path.join(NODE_MODULES_CANDIDATES[0], ...segs)
}
// license texts are written to public/ so they can be served + linked directly
const OUT_DIR = path.join(ROOT, "public", "licenses")
const MANIFEST = path.join(ROOT, "lib", "screenkit", "licenses.generated.json")

const LICENSE_FILE_RE = /^(licen[sc]e|copying|notice|unlicense)(\.[a-z]+)?$/i

async function readJSON(file) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"))
  } catch {
    return null
  }
}

/** Normalise the `license` / `licenses` field into a readable SPDX-ish string. */
function readLicenseField(pkg) {
  if (!pkg) return "UNKNOWN"
  if (typeof pkg.license === "string") return pkg.license
  if (pkg.license && typeof pkg.license === "object" && pkg.license.type)
    return pkg.license.type
  if (Array.isArray(pkg.licenses))
    return pkg.licenses.map((l) => l.type || l).filter(Boolean).join(" OR ") || "UNKNOWN"
  return "UNKNOWN"
}

function readAuthor(pkg) {
  if (!pkg) return null
  const a = pkg.author
  if (!a) return null
  if (typeof a === "string") return a
  if (typeof a === "object") {
    return [a.name, a.email ? `<${a.email}>` : null].filter(Boolean).join(" ") || null
  }
  return null
}

function readRepo(pkg) {
  const r = pkg?.repository
  if (!r) return pkg?.homepage ?? null
  if (typeof r === "string") return r
  if (typeof r === "object" && r.url) return r.url.replace(/^git\+/, "").replace(/\.git$/, "")
  return pkg?.homepage ?? null
}

/** Find and read a LICENSE-like file inside a package directory. */
async function findLicenseText(pkgDir) {
  let entries
  try {
    entries = await fs.readdir(pkgDir, { withFileTypes: true })
  } catch {
    return null
  }
  const match = entries.find(
    (e) => e.isFile() && LICENSE_FILE_RE.test(e.name),
  )
  if (!match) return { file: null, text: null }
  try {
    const text = await fs.readFile(path.join(pkgDir, match.name), "utf8")
    return { file: match.name, text: text.trim() }
  } catch {
    return { file: match.name, text: null }
  }
}

async function safeName(name) {
  // @scope/pkg -> scope__pkg.txt
  return name.replace(/[/\\]/g, "__").replace(/^@/, "") + ".txt"
}

async function main() {
  const rootPkg = await readJSON(path.join(ROOT, "package.json"))
  if (!rootPkg) {
    console.error("[licenses] could not read root package.json")
    process.exit(0)
  }

  const direct = {
    ...(rootPkg.dependencies ?? {}),
    ...(rootPkg.devDependencies ?? {}),
  }
  const names = Object.keys(direct)
    // internal workspace packages are first-party, not third-party licenses
    .filter((n) => !(direct[n] ?? "").startsWith("workspace:"))
    .filter((n) => !n.startsWith("@screenkit/"))
    .sort((a, b) => a.localeCompare(b))

  // reset output folder
  await fs.rm(OUT_DIR, { recursive: true, force: true })
  await fs.mkdir(OUT_DIR, { recursive: true })

  const records = []
  for (const name of names) {
    const pkgDir = path.join(NODE_MODULES, ...name.split("/"))
    const pkg = await readJSON(path.join(pkgDir, "package.json"))
    const license = readLicenseField(pkg)
    const { file, text } = (await findLicenseText(pkgDir)) ?? {}

    let licenseFile = null
    if (text) {
      licenseFile = await safeName(name)
      await fs.writeFile(path.join(OUT_DIR, licenseFile), text, "utf8")
    }

    records.push({
      name,
      version: pkg?.version ?? direct[name].replace(/^[^\d]*/, "") ?? "",
      declared: direct[name],
      license,
      author: readAuthor(pkg),
      repository: readRepo(pkg),
      homepage: pkg?.homepage ?? null,
      licenseFile, // relative to /licenses
      hasText: Boolean(text),
    })
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    count: records.length,
    packages: records,
  }

  await fs.mkdir(path.dirname(MANIFEST), { recursive: true })
  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n", "utf8")

  console.log(
    `[licenses] collected ${records.length} packages, ${records.filter((r) => r.hasText).length} with license text`,
  )
}

main().catch((err) => {
  console.error("[licenses] failed:", err)
  // never block dev/build on a license-collection failure
  process.exit(0)
})
