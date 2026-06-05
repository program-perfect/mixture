import type { Locale, ResolvedInsert } from "@/lib/screenkit/types";

export const LIBRARY_PAGE_SIZE_OPTIONS = [6, 12, 24] as const;

export type LibraryPageSize = (typeof LIBRARY_PAGE_SIZE_OPTIONS)[number];

export type LibrarySortKey =
  | "date-desc"
  | "date-asc"
  | "episode-asc"
  | "episode-desc"
  | "title-asc"
  | "title-desc"
  | "status-asc";

export type LibraryViewMode = "cards" | "compact" | "grid";

export type LibraryListSettings = {
  sort: LibrarySortKey;
  view: LibraryViewMode;
  pageSize: LibraryPageSize;
};

export const DEFAULT_LIBRARY_LIST_SETTINGS: LibraryListSettings = {
  sort: "date-desc",
  view: "cards",
  pageSize: 12,
};

export const LIBRARY_LIST_UI: Record<
  Locale,
  {
    sort: string;
    view: string;
    pageSize: string;
    perPage: string;
    showing: string;
    of: string;
    page: string;
    sortingTitle: string;
    sortingDesc: string;
    displayTitle: string;
    displayDesc: string;
    paginationTitle: string;
    paginationDesc: string;
    sortOptions: Record<LibrarySortKey, string>;
    viewOptions: Record<LibraryViewMode, string>;
  }
> = {
  ru: {
    sort: "сортировка",
    view: "вид",
    pageSize: "на странице",
    perPage: "шт.",
    showing: "показаны",
    of: "из",
    page: "страница",
    sortingTitle: "настройки сортировки",
    sortingDesc: "порядок вставок в библиотеке и внутри выбранной категории.",
    displayTitle: "настройки отображения",
    displayDesc: "метод отображения плашек вставок в библиотеке.",
    paginationTitle: "настройки пагинации",
    paginationDesc: "количество вставок, отображаемых на одной странице.",
    sortOptions: {
      "date-desc": "дата ↓",
      "date-asc": "дата ↑",
      "episode-asc": "серия / сцена ↑",
      "episode-desc": "серия / сцена ↓",
      "title-asc": "название а-я",
      "title-desc": "название я-а",
      "status-asc": "статус",
    },
    viewOptions: {
      cards: "плашки",
      compact: "компактно",
      grid: "сетка",
    },
  },
  en: {
    sort: "sort",
    view: "view",
    pageSize: "per page",
    perPage: "items",
    showing: "showing",
    of: "of",
    page: "page",
    sortingTitle: "sorting settings",
    sortingDesc: "controls the insert order in the library and selected category.",
    displayTitle: "display settings",
    displayDesc: "controls how insert cards are displayed in the library.",
    paginationTitle: "pagination settings",
    paginationDesc: "number of inserts shown on one page.",
    sortOptions: {
      "date-desc": "date ↓",
      "date-asc": "date ↑",
      "episode-asc": "episode / scene ↑",
      "episode-desc": "episode / scene ↓",
      "title-asc": "title a-z",
      "title-desc": "title z-a",
      "status-asc": "status",
    },
    viewOptions: {
      cards: "cards",
      compact: "compact",
      grid: "grid",
    },
  },
};

export function librarySortOptions(locale: Locale) {
  const options = LIBRARY_LIST_UI[locale].sortOptions;
  return (Object.keys(options) as LibrarySortKey[]).map((value) => ({
    value,
    label: options[value],
  }));
}

export function libraryViewOptions(locale: Locale) {
  const options = LIBRARY_LIST_UI[locale].viewOptions;
  return (Object.keys(options) as LibraryViewMode[]).map((value) => ({
    value,
    label: options[value],
  }));
}

export function compareLibraryInserts(a: ResolvedInsert, b: ResolvedInsert, sortKey: LibrarySortKey) {
  switch (sortKey) {
    case "date-asc":
      return dateValue(a.date) - dateValue(b.date) || compareEpisodeScene(a, b);
    case "date-desc":
      return dateValue(b.date) - dateValue(a.date) || compareEpisodeScene(a, b);
    case "episode-asc":
      return compareEpisodeScene(a, b);
    case "episode-desc":
      return compareEpisodeScene(b, a);
    case "title-asc":
      return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
    case "title-desc":
      return b.title.localeCompare(a.title, undefined, { sensitivity: "base" });
    case "status-asc":
      return a.status.localeCompare(b.status) || compareEpisodeScene(a, b);
    default:
      return 0;
  }
}

function compareEpisodeScene(a: ResolvedInsert, b: ResolvedInsert) {
  return (
    numberFromText(a.episode) - numberFromText(b.episode) ||
    numberFromText(a.scene) - numberFromText(b.scene) ||
    a.id.localeCompare(b.id)
  );
}

function dateValue(date: string) {
  const value = Date.parse(date);
  return Number.isNaN(value) ? 0 : value;
}

function numberFromText(value: string) {
  const number = value.match(/\d+/g)?.at(-1);
  return number ? Number(number) : 0;
}
