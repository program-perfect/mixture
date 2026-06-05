# screenkit inserts

В эту папку можно добавлять экранные вставки. Перед `dev` и `build` web-приложение запускает `apps/web/scripts/sync-inserts.mjs` и обновляет `apps/web/lib/screenkit/generated-inserts.ts`.

## 1. Нативная React-вставка

Структура:

```txt
packages/inserts/my-insert/
  package.json
  src/index.tsx
```

`package.json`:

```json
{
  "name": "@screenkit/insert-my-insert",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.tsx"
  },
  "dependencies": {
    "@screenkit/core": "workspace:*",
    "react": "^19"
  }
}
```

`src/index.tsx` должен экспортировать:

```tsx
import type { InsertSceneManifest, SceneProps } from "@screenkit/core"

export const manifest: InsertSceneManifest = {
  key: "my-insert",
  label: "My insert",
  inserts: ["my-insert-id"],
}

export function Scene({ insert, settings }: SceneProps) {
  return <div>{insert.title}</div>
}
```

## 2. Готовый Next.js-проект

Можно положить отдельный Next.js-проект прямо в `packages/inserts`:

```txt
packages/inserts/my-next-screen/
  package.json
  next.config.mjs
  app/...
  screenkit.insert.json
  out/index.html
```

Screenkit не собирает чужой Next-проект сам, потому что у него могут быть свои зависимости и команды. Соберите его внутри папки проекта как статический export, чтобы появился `out/index.html`. После этого `sync-inserts` скопирует `out/` в `apps/web/public/screenkit-inserts/my-next-screen/` и подключит его в библиотеку через iframe.

Минимальный `screenkit.insert.json`:

```json
{
  "id": "my-next-screen",
  "category": "phones",
  "device": "phone",
  "aspect": "9:16",
  "status": "draft",
  "date": "2026-06-01",
  "episode": "ep.auto",
  "scene": "sc.auto",
  "title": {
    "ru": "моя next-вставка",
    "en": "my next insert"
  },
  "description": {
    "ru": "описание для библиотеки",
    "en": "library description"
  }
}
```

Если `out/index.html` отсутствует, вставка всё равно появится в библиотеке, но в превью будет заглушка с подсказкой собрать проект.

## Команда

```bash
pnpm --filter web sync-inserts
```

Она также запускается автоматически перед `pnpm --filter web dev` и `pnpm --filter web build`.
