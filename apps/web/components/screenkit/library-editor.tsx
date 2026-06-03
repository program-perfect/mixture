"use client"

import * as React from "react"
import { Plus, RotateCcw, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DEVICES, STATUSES, ASPECTS } from "@/lib/screenkit/data"
import { deviceLabel, statusLabel } from "@/lib/screenkit/i18n"
import type {
  AspectRatio,
  DeviceType,
  InsertStatus,
} from "@/lib/screenkit/types"
import { useScreenkit } from "./store"

/* ---------- shared field shell ---------- */

function Fld({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="font-mono text-[11px] lowercase text-text-secondary">
        {label}
        {hint ? (
          <span className="ml-1 text-text-faint">— {hint}</span>
        ) : null}
      </Label>
      {children}
    </div>
  )
}

const inputCls =
  "h-10 rounded-xl border-panel-border bg-control font-mono text-sm text-foreground placeholder:text-text-faint focus-visible:ring-ring"
const areaCls =
  "rounded-xl border-panel-border bg-control font-mono text-sm text-foreground placeholder:text-text-faint focus-visible:ring-ring"
const triggerCls =
  "h-10 rounded-xl border-panel-border bg-control font-mono text-sm lowercase text-foreground focus:ring-ring"

/* ---------- add category ---------- */

function AddCategoryDialog() {
  const { addCategory, libraryBusy, t } = useScreenkit()
  const [open, setOpen] = React.useState(false)
  const [labelRu, setLabelRu] = React.useState("")
  const [labelEn, setLabelEn] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [icon, setIcon] = React.useState<string>("layers")
  const [accent, setAccent] = React.useState<string>(ACCENT_OPTIONS[0])
  const [error, setError] = React.useState<string | null>(null)

  async function submit() {
    if (!labelRu.trim()) {
      setError(t("editor.required"))
      return
    }
    setError(null)
    await addCategory({
      labelRu,
      labelEn: labelEn || undefined,
      slug: slug || undefined,
      icon,
      accent,
    })
    setLabelRu("")
    setLabelEn("")
    setSlug("")
    setIcon("layers")
    setAccent(ACCENT_OPTIONS[0])
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 rounded-xl border border-panel-border bg-control px-3 py-2 font-mono text-xs lowercase text-foreground transition-colors hover:bg-panel-hover">
          <Plus className="size-3.5" /> {t("editor.addCategory")}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md border-panel-border bg-panel">
        <DialogHeader>
          <DialogTitle className="font-mono lowercase text-foreground">
            {t("editor.newCategory")}
          </DialogTitle>
          <DialogDescription className="font-mono text-xs lowercase text-text-muted">
            {t("editor.newCategoryDesc")}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <Fld label={t("editor.labelRu")}>
            <Input
              value={labelRu}
              onChange={(e) => setLabelRu(e.target.value)}
              placeholder={t("editor.labelRuPh")}
              className={inputCls}
            />
          </Fld>
          <Fld label={t("editor.labelEn")} hint={t("editor.optional")}>
            <Input
              value={labelEn}
              onChange={(e) => setLabelEn(e.target.value)}
              placeholder={t("editor.labelEnPh")}
              className={inputCls}
            />
          </Fld>
          <Fld label={t("editor.slug")} hint={t("editor.slugHint")}>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={t("editor.slugPh")}
              className={inputCls}
            />
          </Fld>

          <Fld label={t("editor.color")} hint={t("editor.colorHint")}>
            <div className="flex flex-wrap items-center gap-2">
              {ACCENT_OPTIONS.map((c) => {
                const selected = accent === c
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAccent(c)}
                    aria-pressed={selected}
                    aria-label={c}
                    className={cn(
                      "size-8 rounded-full border-2 transition-transform",
                      selected
                        ? "scale-110 border-foreground"
                        : "border-transparent hover:scale-105",
                    )}
                    style={{ background: c }}
                  />
                )
              })}
            </div>
          </Fld>

          <Fld label={t("editor.icon")} hint={t("editor.iconHint")}>
            <div className="grid max-h-40 grid-cols-7 gap-1.5 overflow-y-auto rounded-xl border border-panel-border bg-control p-2 sk-scroll sm:grid-cols-9">
              {ICON_NAMES.map((name) => {
                const Glyph = ICON_LIBRARY[name]
                const selected = icon === name
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setIcon(name)}
                    aria-pressed={selected}
                    aria-label={name}
                    className={cn(
                      "flex aspect-square items-center justify-center rounded-lg border transition-colors",
                      selected
                        ? "border-transparent text-control-active-foreground"
                        : "border-panel-border text-text-secondary hover:bg-panel-hover hover:text-foreground",
                    )}
                    style={
                      selected
                        ? { background: accent, color: "#050505" }
                        : undefined
                    }
                  >
                    <Glyph className="size-4" />
                  </button>
                )
              })}
            </div>
          </Fld>

          {error ? (
            <p className="font-mono text-xs text-accent-red">{error}</p>
          ) : null}
        </div>
        <DialogFooter>
          <button
            onClick={submit}
            disabled={libraryBusy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-control-active px-4 py-2.5 font-mono text-sm lowercase text-control-active-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {libraryBusy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            {t("editor.save")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ---------- add insert ---------- */

const emptyInsert = {
  titleRu: "",
  titleEn: "",
  slug: "",
  descriptionRu: "",
  descriptionEn: "",
  episode: "ep-01",
  scene: "sc-01",
  date: "",
  promptRu: "",
  shortPromptRu: "",
  negativePromptRu: "",
}

function AddInsertDialog() {
  const { addInsert, libraryBusy, categories, catLabel, t } = useScreenkit()
  const [open, setOpen] = React.useState(false)
  const [f, setF] = React.useState({ ...emptyInsert })
  const [category, setCategory] = React.useState(categories[0]?.id ?? "phones")
  const [device, setDevice] = React.useState<DeviceType>("phone")
  const [aspect, setAspect] = React.useState<AspectRatio>("9:16")
  const [status, setStatus] = React.useState<InsertStatus>("draft")
  const [error, setError] = React.useState<string | null>(null)

  const set = (k: keyof typeof emptyInsert) => (v: string) =>
    setF((prev) => ({ ...prev, [k]: v }))

  async function submit() {
    if (!f.titleRu.trim() || !f.date.trim()) {
      setError(t("editor.required"))
      return
    }
    setError(null)
    await addInsert({
      slug: f.slug || undefined,
      category: String(category),
      device,
      aspect,
      status,
      episode: f.episode || "ep-01",
      scene: f.scene || "sc-01",
      date: f.date,
      titleRu: f.titleRu,
      titleEn: f.titleEn || undefined,
      descriptionRu: f.descriptionRu || undefined,
      descriptionEn: f.descriptionEn || undefined,
      promptRu: f.promptRu || undefined,
      shortPromptRu: f.shortPromptRu || undefined,
      negativePromptRu: f.negativePromptRu || undefined,
    })
    setF({ ...emptyInsert })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 rounded-xl bg-control-active px-3 py-2 font-mono text-xs lowercase text-control-active-foreground transition-opacity hover:opacity-90">
          <Plus className="size-3.5" /> {t("editor.addInsert")}
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-panel-border bg-panel">
        <DialogHeader>
          <DialogTitle className="font-mono lowercase text-foreground">
            {t("editor.newInsert")}
          </DialogTitle>
          <DialogDescription className="font-mono text-xs lowercase text-text-muted">
            {t("editor.newInsertDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Fld label={t("editor.titleRu")}>
              <Input
                value={f.titleRu}
                onChange={(e) => set("titleRu")(e.target.value)}
                placeholder={t("editor.titleRuPh")}
                className={inputCls}
              />
            </Fld>
            <Fld label={t("editor.titleEn")} hint={t("editor.optional")}>
              <Input
                value={f.titleEn}
                onChange={(e) => set("titleEn")(e.target.value)}
                placeholder={t("editor.titleEnPh")}
                className={inputCls}
              />
            </Fld>
          </div>

          <Fld label={t("editor.slug")} hint={t("editor.slugHint")}>
            <Input
              value={f.slug}
              onChange={(e) => set("slug")(e.target.value)}
              placeholder={t("editor.slugPh")}
              className={inputCls}
            />
          </Fld>

          <div className="grid gap-4 sm:grid-cols-4">
            <Fld label={t("library.category")}>
              <Select
                value={String(category)}
                onValueChange={(v) => setCategory(v)}
              >
                <SelectTrigger className={triggerCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem
                      key={c.id}
                      value={String(c.id)}
                      className="lowercase"
                    >
                      {catLabel(c.id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Fld>
            <Fld label={t("library.device")}>
              <Select
                value={device}
                onValueChange={(v) => setDevice(v as DeviceType)}
              >
                <SelectTrigger className={triggerCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEVICES.map((d) => (
                    <SelectItem key={d.id} value={d.id} className="lowercase">
                      {deviceLabel(d.id, "ru")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Fld>
            <Fld label={t("editor.aspect")}>
              <Select
                value={aspect}
                onValueChange={(v) => setAspect(v as AspectRatio)}
              >
                <SelectTrigger className={triggerCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASPECTS.map((a) => (
                    <SelectItem key={a} value={a} className="lowercase">
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Fld>
            <Fld label={t("library.status")}>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as InsertStatus)}
              >
                <SelectTrigger className={triggerCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="lowercase">
                      {statusLabel(s.id, "ru")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Fld>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Fld label={t("editor.episode")}>
              <Input
                value={f.episode}
                onChange={(e) => set("episode")(e.target.value)}
                className={inputCls}
              />
            </Fld>
            <Fld label={t("editor.scene")}>
              <Input
                value={f.scene}
                onChange={(e) => set("scene")(e.target.value)}
                className={inputCls}
              />
            </Fld>
            <Fld label={t("editor.date")}>
              <Input
                value={f.date}
                onChange={(e) => set("date")(e.target.value)}
                placeholder="2031-04-12"
                className={inputCls}
              />
            </Fld>
          </div>

          <Fld label={t("editor.description")} hint={t("editor.optional")}>
            <Textarea
              value={f.descriptionRu}
              onChange={(e) => set("descriptionRu")(e.target.value)}
              rows={2}
              className={areaCls}
            />
          </Fld>

          <Fld label={t("editor.prompt")} hint={t("editor.optional")}>
            <Textarea
              value={f.promptRu}
              onChange={(e) => set("promptRu")(e.target.value)}
              rows={3}
              className={areaCls}
            />
          </Fld>

          <div className="grid gap-4 sm:grid-cols-2">
            <Fld label={t("editor.shortPrompt")} hint={t("editor.optional")}>
              <Textarea
                value={f.shortPromptRu}
                onChange={(e) => set("shortPromptRu")(e.target.value)}
                rows={2}
                className={areaCls}
              />
            </Fld>
            <Fld label={t("editor.negativePrompt")} hint={t("editor.optional")}>
              <Textarea
                value={f.negativePromptRu}
                onChange={(e) => set("negativePromptRu")(e.target.value)}
                rows={2}
                className={areaCls}
              />
            </Fld>
          </div>

          {error ? (
            <p className="font-mono text-xs text-accent-red">{error}</p>
          ) : null}
        </div>

        <DialogFooter>
          <button
            onClick={submit}
            disabled={libraryBusy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-control-active px-4 py-2.5 font-mono text-sm lowercase text-control-active-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {libraryBusy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            {t("editor.save")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ---------- reset ---------- */

function ResetButton() {
  const { resetLibrary, libraryBusy, hasCustom, t } = useScreenkit()
  if (!hasCustom) return null
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 rounded-xl border border-panel-border bg-control px-3 py-2 font-mono text-xs lowercase text-text-secondary transition-colors hover:bg-panel-hover hover:text-foreground">
          <RotateCcw className="size-3.5" /> {t("editor.reset")}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-panel-border bg-panel">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-mono lowercase text-foreground">
            {t("editor.resetTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription className="font-mono text-xs lowercase text-text-muted">
            {t("editor.resetDesc")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl border-panel-border bg-control font-mono text-sm lowercase text-foreground">
            {t("editor.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => resetLibrary()}
            disabled={libraryBusy}
            className="rounded-xl bg-accent-red font-mono text-sm lowercase text-white hover:opacity-90"
          >
            {t("editor.resetConfirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function LibraryEditor() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <AddInsertDialog />
      <AddCategoryDialog />
      <ResetButton />
    </div>
  )
}
