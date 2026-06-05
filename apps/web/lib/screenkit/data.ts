import { CATEGORY_LABELS } from "./i18n";
import { GENERATED_INSERT_CATEGORIES, GENERATED_INSERTS } from "./generated-inserts";
import type {
  AspectRatio,
  CategoryDef,
  CategoryId,
  DeviceType,
  Insert,
  InsertStatus,
  Locale,
  LocalizedList,
  LocalizedText,
  PlaybackMode,
  ResolvedInsert,
} from "./types";

export const PROJECT_VERSION = "v0.9-gs-screenkit";
export const PROJECT_SUBTITLE = "гремучая смесь / prop playback system";

export type CategoryMeta = {
  id: CategoryId;
  accent: string;
  tint: string;
};

export const CATEGORIES: CategoryMeta[] = [
  { id: "phones", accent: "var(--accent-orange)", tint: "rgba(255,159,28,0.14)" },
  { id: "cctv", accent: "var(--accent-red)", tint: "rgba(239,71,111,0.14)" },
  { id: "trackers", accent: "var(--accent-purple)", tint: "rgba(108,99,255,0.16)" },
  { id: "tv-news", accent: "var(--accent-blue)", tint: "rgba(47,128,237,0.14)" },
  { id: "bank", accent: "var(--accent-green)", tint: "rgba(34,197,94,0.14)" },
  { id: "hq-monitors", accent: "var(--accent-cyan)", tint: "rgba(76,201,240,0.14)" },
];

export const categoryMeta = (id: CategoryId): CategoryMeta => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];

/* built-in categories as fully self-describing defs (meta + localized label) */
export const DEFAULT_CATEGORY_DEFS: CategoryDef[] = [
  ...CATEGORIES.map((c) => ({
    id: c.id,
    accent: c.accent,
    tint: c.tint,
    label: {
      ru: CATEGORY_LABELS.ru[c.id as keyof (typeof CATEGORY_LABELS)["ru"]],
      en: CATEGORY_LABELS.en[c.id as keyof (typeof CATEGORY_LABELS)["en"]],
    },
  })),
  ...GENERATED_INSERT_CATEGORIES,
];

/* merge built-in defaults with custom (server-stored) rows */
export const buildCategoryDefs = (custom: CategoryDef[] = []): CategoryDef[] => {
  const ids = new Set(DEFAULT_CATEGORY_DEFS.map((c) => c.id));
  return [...DEFAULT_CATEGORY_DEFS, ...custom.filter((c) => !ids.has(c.id))];
};

export const mergeInserts = (custom: Insert[] = []): Insert[] => {
  const ids = new Set(INSERTS.map((i) => i.id));
  return [...INSERTS, ...custom.filter((i) => !ids.has(i.id))];
};

export const findInsert = (list: Insert[], id: string): Insert | undefined => list.find((i) => i.id === id);

export const findCategoryDef = (list: CategoryDef[], id: CategoryId): CategoryDef | undefined =>
  list.find((c) => c.id === id);

export const categoryLabelFromDef = (def: CategoryDef, locale: Locale): string =>
  locale === "en" ? (def.label.en ?? def.label.ru) : def.label.ru;

export const DEVICES: { id: DeviceType; aspect: AspectRatio }[] = [
  { id: "phone", aspect: "9:16" },
  { id: "monitor", aspect: "16:9" },
  { id: "tv", aspect: "16:9" },
  { id: "tablet", aspect: "16:10" },
  { id: "projector", aspect: "16:9" },
  { id: "cctv", aspect: "4:3" },
];

export const ASPECTS: AspectRatio[] = ["9:16", "16:9", "4:3", "16:10"];

export const PLAYBACK_MODES: { id: PlaybackMode }[] = [{ id: "clean" }, { id: "filmed" }, { id: "dirty" }];

export const STATUSES: { id: InsertStatus; accent: string }[] = [
  { id: "draft", accent: "var(--text-muted)" },
  { id: "ready", accent: "var(--accent-green)" },
  { id: "needs review", accent: "var(--accent-orange)" },
  { id: "shooting", accent: "var(--accent-red)" },
];

export const statusAccent = (s: InsertStatus): string =>
  STATUSES.find((x) => x.id === s)?.accent ?? "var(--text-muted)";

/* ------------------------------- resolvers ------------------------------- */

export const pick = (t: LocalizedText, locale: Locale): string => (locale === "en" ? (t.en ?? t.ru) : t.ru);
export const pickList = (l: LocalizedList, locale: Locale): string[] => (locale === "en" ? (l.en ?? l.ru) : l.ru);
export const hasEnglish = (insert: Insert): boolean => typeof insert.title.en === "string";

export function resolveInsert(insert: Insert, locale: Locale): ResolvedInsert {
  return {
    id: insert.id,
    date: insert.date,
    episode: insert.episode,
    scene: insert.scene,
    category: insert.category,
    device: insert.device,
    aspect: insert.aspect,
    status: insert.status,
    title: pick(insert.title, locale),
    description: pick(insert.description, locale),
    prompt: pick(insert.prompt, locale),
    shortPrompt: pick(insert.shortPrompt, locale),
    negativePrompt: pick(insert.negativePrompt, locale),
    technicalNotes: pickList(insert.technicalNotes, locale),
    hasEnglish: hasEnglish(insert),
  };
}

/* --------------------------------- data --------------------------------- */

export const INSERTS: Insert[] = [
  ...GENERATED_INSERTS,
  {
    id: "gs-001",
    date: "2026-03-04",
    episode: "ep.01",
    scene: "sc.14",
    category: "cctv",
    device: "cctv",
    aspect: "4:3",
    status: "ready",
    title: {
      ru: "скрытая камера в глазу манекена",
      en: "hidden camera in mannequin eye",
    },
    description: {
      ru: "скрытый объектив в глазу манекена в магазине. рыбий глаз охватывает торговый зал бутика, ик-подсветка ночью.",
      en: "covert lens embedded in a shop mannequin. fisheye coverage of the boutique floor, IR tint at night.",
    },
    prompt: {
      ru: "скрытая микрокамера в глазу манекена, искажение «рыбий глаз» 4:3, интерьер бутика ночью, инфракрасный зелёно-серый оттенок, сильный шум сенсора, бледный таймстамп в левом верхнем углу, дрожание кадра, низкий битрейт наблюдения, реквизитная вставка для русского криминального сериала",
      en: "covert pinhole camera feed hidden inside a mannequin eye, 4:3 fisheye distortion, boutique interior at night, infrared green-grey tint, heavy sensor noise, faint timestamp overlay top-left, dead-frame jitter, low bitrate surveillance look, gritty russian crime series prop insert",
    },
    shortPrompt: {
      ru: "шпионская камера в глазу манекена, рыбий глаз 4:3, ик-ночь, грязное cctv",
      en: "mannequin-eye spy cam, fisheye 4:3, IR night, gritty cctv",
    },
    negativePrompt: {
      ru: "чистый, цветокоррекция, кинематографичный, резкий, современный ui, водяной знак, текстовый логотип",
      en: "clean, color-graded, cinematic, sharp, modern UI, watermark, text logo",
    },
    technicalNotes: {
      ru: [
        "соотношение 4:3 / бочкообразное искажение «рыбий глаз»",
        "ик-отсечка: обесцвеченный зелёно-серый",
        "таймстамп вшит сверху слева, моношрифт",
        "шум сенсора + редкие выпавшие кадры",
      ],
      en: [
        "aspect 4:3 / fisheye barrel distortion",
        "IR cut-off look: desaturated green-grey",
        "timestamp burned top-left, mono font",
        "sensor noise + occasional dropped frame",
      ],
    },
  },
];
