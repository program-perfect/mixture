# mixture · screenkit

A bilingual (RU/EN) **screen-insert production library** — a workspace for
planning, describing, and previewing the on-screen graphics ("inserts") that
appear on phones, monitors, TVs, CCTV feeds, and trackers in film and video
production.

Each insert is a self-contained package with a live, rendered preview. The web
app ties them together into a searchable, categorized library with a timeline,
prompt sheets, and a fully personalizable interface.

---

## Highlights

- **Live insert previews** — every insert renders inside a real device frame
  (phone, monitor, TV, tablet, projector, CCTV) with the correct aspect ratio.
- **Categorized library** — filter inserts by category; add your own categories
  with a **custom icon** and **accent color**. New inserts inherit the icon of
  their target device and the color of their category.
- **Personalization** — light / dark / system themes, swappable accent
  palettes, adjustable gradient intensity, and a site-wide **scale (zoom)**
  control. Every choice is remembered locally.
- **Considered motion** — smooth crossfades on theme and palette changes,
  eased resizing of preview frames and panels, and smooth scrolling. A motion
  setting (auto / on / reduced) respects `prefers-reduced-motion` and
  low-powered devices.
- **Bilingual UI** — Russian and English throughout, including entity labels.
- **Persistent data** — categories and inserts are stored in Postgres (Neon)
  via Drizzle, with optimistic client updates.

---

## Tech stack

| Area        | Choice                                            |
| ----------- | ------------------------------------------------- |
| Framework   | Next.js (App Router) + React                      |
| Language    | TypeScript                                        |
| Styling     | Tailwind CSS v4 with semantic design tokens       |
| UI          | shadcn/ui + lucide icons                          |
| Database    | Neon Postgres                                     |
| ORM         | Drizzle                                           |
| Data layer  | Server Actions + SWR (optimistic updates)         |
| Monorepo    | pnpm workspaces                                   |

---

## Project structure

```
.
├── apps/
│   └── web/                     # the Next.js application
│       ├── app/                 # routes, layout, server actions
│       ├── components/
│       │   └── screenkit/       # app shell, rail, category panel,
│       │                        # theme + motion providers, sections
│       └── lib/
│           ├── db/              # Drizzle schema + client
│           └── screenkit/       # data, i18n, server fetchers, types
└── packages/
    ├── screenkit-core/          # shared types (CategoryDef, Insert, …)
    └── inserts/                 # one package per insert scene (live previews)
```

---

## Getting started

> Requires **pnpm** and a **Neon** Postgres connection string.

```bash
# 1. install dependencies
pnpm install

# 2. provide the database url (Neon)
#    DATABASE_URL is wired up automatically by the Neon integration on Vercel.

# 3. run the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Database

The library is backed by two tables — `screenkit_categories` and
`screenkit_inserts`. The schema lives in
[`apps/web/lib/db/schema.ts`](apps/web/lib/db/schema.ts). Categories carry an
optional `icon` and an accent color that inserts inherit.

---

## Personalization

All appearance controls live in the **Style** section (the palette icon in the
left rail):

- **Theme** — light, dark, or follow the system. Switching crossfades smoothly.
- **Palette** — pick the interface accent set.
- **Gradients** — off, soft, or vivid, applied to category tiles, icons, and
  accents while staying minimal.
- **Scale** — compact → huge. Scales text, padding, and elements together by
  adjusting the root font size.
- **Motion** — auto, on, or reduced. Auto defaults to reduced when the system
  asks for it or the device looks underpowered.

---

## Built with v0

This repository is linked to a [v0](https://v0.app) project. Continue
developing by visiting the link below — start new chats to make changes, and v0
will push commits directly to this repo. Every merge to `main` deploys
automatically.

[Continue working on v0 →](https://v0.app/chat/projects/prj_bCVZAT6sHWAY7JAYp9dXXlJDV2PU)
