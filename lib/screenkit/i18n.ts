import type {
  CategoryId,
  DeviceType,
  InsertStatus,
  Locale,
  PlaybackMode,
} from "./types"

export const LOCALES: Locale[] = ["ru", "en"]
export const DEFAULT_LOCALE: Locale = "ru"
export const LOCALE_STORAGE_KEY = "screenkit-locale"

export const LANG_LABEL: Record<Locale, string> = {
  ru: "русский",
  en: "english",
}

/* short tag used on compact toggles */
export const LANG_TAG: Record<Locale, string> = {
  ru: "ru",
  en: "en",
}

/* ---------------------------- ui dictionary ---------------------------- */

type Dict = Record<string, string>

const RU: Dict = {
  "project.name": "экранные вставки",

  // sections / nav
  "section.overview": "обзор",
  "section.library": "библиотека",
  "section.preview": "превью",
  "section.timeline": "таймлайн",
  "section.prompts": "промпты",
  "section.export": "экспорт",
  "section.style": "оформление",
  "section.about": "для души",
  "nav.appearance": "оформление",
  "nav.metadata": "метаданные",
  "nav.export": "экспорт",
  "nav.infoForNerds": "для души",
  "nav.about": "о проекте",
  "nav.allInserts": "все вставки",
  "nav.menu": "меню",
  "nav.navigation": "навигация",
  "nav.openMenu": "открыть меню",
  "nav.closeMenu": "закрыть меню",

  // overview
  "overview.lead":
    "приватный инструмент художественного цеха: проектируйте, просматривайте, организуйте и выгружайте экранные вставки, которые видны на телефонах, мониторах, камерах наблюдения и телевизорах в сериале. не загрузчик. не конвертер. только реквизит.",
  "overview.openLibrary": "открыть библиотеку",
  "overview.devicePreview": "превью на устройстве",
  "overview.recentInserts": "последние вставки",
  "overview.total": "всего",

  // library
  "library.title": "библиотека вставок",
  "library.desc":
    "все экранные вставки в производстве. фильтруйте по категории, устройству или статусу. откройте любую, чтобы загрузить её в превью устройства.",
  "library.search": "поиск вставок…",
  "library.category": "категория",
  "library.device": "устройство",
  "library.status": "статус",
  "library.all": "все",
  "library.dateEpisodeScene": "дата · серия · сцена",
  "library.preview": "превью",
  "library.empty": "нет вставок по этим фильтрам.",
  "library.countOne": "вставка",
  "library.countMany": "вставок",

  // preview
  "preview.title": "превью на устройстве",
  "preview.desc":
    "загрузите вставку на рамку устройства и отгрейдируйте её под кадр. чистый источник, съёмка с экрана или грязное воспроизведение.",
  "preview.openFullscreen": "открыть как полноэкранный скрин-стейт",
  "preview.deviceFormat": "формат устройства",
  "preview.deviceFormatDesc": "физический экран, на котором появляется вставка.",
  "preview.playbackMode": "режим воспроизведения",
  "preview.aspect": "соотношение сторон",
  "preview.aspectDesc": "кадрируйте вставку под реквизитное устройство.",
  "preview.brightness": "яркость",
  "preview.brightnessDesc": "светимость экрана и спад.",
  "preview.noise": "шум",
  "preview.noiseDesc": "зерно сенсора и артефакты компрессии.",
  "preview.reflections": "отражения",
  "preview.reflectionsDesc": "блики экрана и отражения комнаты при съёмке.",
  "preview.scanlines": "строчная развёртка",
  "preview.scanlinesDesc": "паттерн строк crt / чересстрочной развёртки.",
  "preview.timestamp": "таймстамп",
  "preview.timestampDesc": "вшитая дата/время поверх кадра.",
  "preview.insertLanguage": "язык вставки",
  "preview.insertLanguageDesc":
    "язык контента внутри этой вставки. меняется отдельно и не затрагивает язык сайта.",

  // prompts
  "prompts.title": "лист промптов",
  "prompts.desc":
    "готовые к генерации промпты для каждой вставки. негативные промпты и технические заметки держат каждый экран консистентным и безопасным для бренда.",
  "prompts.id": "id",
  "prompts.episodeScene": "серия / сцена",
  "prompts.device": "устройство",
  "prompts.aspect": "соотношение",
  "prompts.full": "полный промпт",
  "prompts.short": "короткий промпт",
  "prompts.negative": "негативный промпт",
  "prompts.notes": "технические заметки",

  // export
  "export.title": "рендер и экспорт",
  "export.desc":
    "запеките отгрейдированную вставку в формат доставки для монтажа. выберите кодек, look воспроизведения и вшивку метаданных.",
  "export.format": "формат",
  "export.playbackLook": "look воспроизведения",
  "export.burnIn": "вшивка метаданных",
  "export.burnInDesc": "серия, сцена и id запекаются в угол.",
  "export.loop": "бесшовный луп",
  "export.loopDesc": "отрендерить идеальный луп для воспроизведения на площадке.",
  "export.queued": "вставок в очереди",
  "export.look": "look",
  "export.estSize": "прим. размер",
  "export.renderQueue": "очередь рендера",
  "export.json": "экспорт json",
  "export.promptSheet": "лист промптов",

  // style / appearance
  "style.title": "оформление",
  "style.desc":
    "визуальный язык каждой экранной вставки — терминальный интерфейс в духе cobalt со сдержанностью уровня vercel.",
  "style.language": "язык",
  "style.languageDesc":
    "язык интерфейса всего сайта. русский — основной. язык внутри отдельных вставок переключается независимо.",
  "style.palette": "палитра",
  "style.typography": "типографика",
  "style.principles": "принципы",
  "style.typeSample": "экранные вставки",
  "style.typeMono": "geist mono · съешь ещё этих мягких булок 0123456789",
  "style.typeBody":
    "основной текст остаётся в моноширинном начертании при комфортном размере с расслабленным межстрочным интервалом.",

  // about
  "about.title": "о проекте",
  "about.desc":
    "система воспроизведения реквизита, которая проектирует, грейдит и поставляет фальшивые экраны из криминального сериала: телефоны, камеры наблюдения, трекеры, новостные бегущие строки и банковские терминалы.",
  "about.version": "версия",
  "about.totalInserts": "всего вставок",
  "about.categories": "категории",
  "about.defaultMode": "режим по умолчанию",
  "about.fullscreen": "полноэкранный",
  "about.architecture": "архитектура",
  "about.archDesc":
    "построено как сервис-ориентированное рабочее пространство: каждая вставка открывается как изолированный полноэкранный скрин-стейт без общего хедера или футера — только тихая плавающая кнопка для возврата, полноэкранного режима и ориентации. структура напрямую ложится на раскладку turborepo apps/*, чтобы каждая поверхность могла вырасти в отдельное приложение.",
  "about.shell": "оболочка",
  "about.ui": "ui",
  "about.screenStates": "скрин-стейты",
  "about.formfactors": "формфакторы",
  "about.formfactorsValue": "мобильный → тв",
  "about.catalogue": "каталог",
  "about.insertsSuffix": "вставок",

  // floating menu
  "fm.back": "на главную",
  "fm.fullscreen": "полный экран",
  "fm.exitFullscreen": "выйти из полного экрана",
  "fm.rotate": "повернуть",
  "fm.locked": "ориентация заблокирована",
  "fm.lock": "заблокировать ориентацию",
  "fm.landscape": "альбомная",
  "fm.portrait": "книжная",

  // shared
  "common.copy": "копировать",
  "common.copied": "скопировано",
  "common.ruOnly": "только ru",
  "common.ruOnlyHint": "английский перевод не добавлен",
}

const EN: Dict = {
  "project.name": "screen inserts",

  "section.overview": "overview",
  "section.library": "library",
  "section.preview": "preview",
  "section.timeline": "timeline",
  "section.prompts": "prompts",
  "section.export": "export",
  "section.style": "appearance",
  "section.about": "info for nerds",
  "nav.appearance": "appearance",
  "nav.metadata": "metadata",
  "nav.export": "export",
  "nav.infoForNerds": "info for nerds",
  "nav.about": "about",
  "nav.allInserts": "all inserts",
  "nav.menu": "menu",
  "nav.navigation": "navigation",
  "nav.openMenu": "open menu",
  "nav.closeMenu": "close menu",

  "overview.lead":
    "a private art-department tool to design, preview, organize and export the screen inserts seen on phones, monitors, cctv feeds and tv sets across the series. not a downloader. not a converter. just props.",
  "overview.openLibrary": "open library",
  "overview.devicePreview": "device preview",
  "overview.recentInserts": "recent inserts",
  "overview.total": "total",

  "library.title": "insert library",
  "library.desc":
    "every screen insert in the production. filter by category, device or status. open any item to load it into the device preview.",
  "library.search": "search inserts…",
  "library.category": "category",
  "library.device": "device",
  "library.status": "status",
  "library.all": "all",
  "library.dateEpisodeScene": "date · episode · scene",
  "library.preview": "preview",
  "library.empty": "no inserts match these filters.",
  "library.countOne": "insert",
  "library.countMany": "inserts",

  "preview.title": "device preview",
  "preview.desc":
    "load an insert onto a device frame and grade it for the shot. clean source, filmed-from-screen, or dirty playback.",
  "preview.openFullscreen": "open as fullscreen screen-state",
  "preview.deviceFormat": "device format",
  "preview.deviceFormatDesc": "the physical screen the insert appears on.",
  "preview.playbackMode": "playback mode",
  "preview.aspect": "aspect ratio",
  "preview.aspectDesc": "frame the insert to match the prop device.",
  "preview.brightness": "brightness",
  "preview.brightnessDesc": "screen luminance and falloff.",
  "preview.noise": "noise",
  "preview.noiseDesc": "sensor grain and compression artefacts.",
  "preview.reflections": "reflections",
  "preview.reflectionsDesc": "screen glare and room reflections when filmed.",
  "preview.scanlines": "scanlines",
  "preview.scanlinesDesc": "crt / interlace scanline pattern.",
  "preview.timestamp": "timestamp",
  "preview.timestampDesc": "burned-in date/time overlay.",
  "preview.insertLanguage": "insert language",
  "preview.insertLanguageDesc":
    "the language of the content inside this insert. switches independently and does not affect the site language.",

  "prompts.title": "prompt sheet",
  "prompts.desc":
    "generation-ready prompts for each insert. negative prompts and technical notes keep every screen consistent and brand-safe.",
  "prompts.id": "id",
  "prompts.episodeScene": "episode / scene",
  "prompts.device": "device",
  "prompts.aspect": "aspect",
  "prompts.full": "full prompt",
  "prompts.short": "short prompt",
  "prompts.negative": "negative prompt",
  "prompts.notes": "technical notes",

  "export.title": "render & export",
  "export.desc":
    "bake the graded insert to a delivery format for editorial. choose a codec, a playback look, and metadata burn-in.",
  "export.format": "format",
  "export.playbackLook": "playback look",
  "export.burnIn": "metadata burn-in",
  "export.burnInDesc": "episode, scene and id baked into the corner.",
  "export.loop": "seamless loop",
  "export.loopDesc": "render a perfect loop for on-set playback.",
  "export.queued": "queued inserts",
  "export.look": "look",
  "export.estSize": "est. size",
  "export.renderQueue": "render queue",
  "export.json": "export json",
  "export.promptSheet": "prompt sheet",

  "style.title": "appearance",
  "style.desc":
    "the visual language behind every screen insert — a cobalt-style terminal interface with vercel-grade restraint.",
  "style.language": "language",
  "style.languageDesc":
    "the interface language of the whole site. russian is primary. the language inside individual inserts switches independently.",
  "style.palette": "palette",
  "style.typography": "typography",
  "style.principles": "principles",
  "style.typeSample": "screen inserts",
  "style.typeMono": "geist mono · the quick brown fox 0123456789",
  "style.typeBody":
    "body copy stays in mono at a comfortable reading size with relaxed line-height.",

  "about.title": "about",
  "about.desc":
    "a prop playback system that designs, grades and delivers the fake screens you see in a crime series: phones, cctv feeds, trackers, news tickers and bank terminals.",
  "about.version": "version",
  "about.totalInserts": "total inserts",
  "about.categories": "categories",
  "about.defaultMode": "default mode",
  "about.fullscreen": "fullscreen",
  "about.architecture": "architecture",
  "about.archDesc":
    "built as a service-oriented workspace: each insert opens as its own isolated fullscreen screen-state with no shared header or footer — only a quiet floating control for back, fullscreen and orientation. the structure maps directly onto a turborepo apps/* layout so each surface can graduate into its own deployable app.",
  "about.shell": "shell",
  "about.ui": "ui",
  "about.screenStates": "screen-states",
  "about.formfactors": "formfactors",
  "about.formfactorsValue": "mobile → tv",
  "about.catalogue": "catalogue",
  "about.insertsSuffix": "inserts",

  "fm.back": "back to home",
  "fm.fullscreen": "fullscreen",
  "fm.exitFullscreen": "exit fullscreen",
  "fm.rotate": "rotate",
  "fm.locked": "orientation locked",
  "fm.lock": "lock orientation",
  "fm.landscape": "landscape",
  "fm.portrait": "portrait",

  "common.copy": "copy",
  "common.copied": "copied",
  "common.ruOnly": "ru only",
  "common.ruOnlyHint": "english translation not added",
}

const DICT: Record<Locale, Dict> = { ru: RU, en: EN }

export function translate(locale: Locale, key: string): string {
  return DICT[locale][key] ?? DICT.ru[key] ?? key
}

/* ----------------------- localized entity labels ----------------------- */

export const CATEGORY_LABELS: Record<Locale, Record<CategoryId, string>> = {
  ru: {
    phones: "телефоны",
    cctv: "видеонаблюдение",
    trackers: "трекеры",
    "tv-news": "тв-новости",
    bank: "банк",
    "hq-monitors": "мониторы штаба",
  },
  en: {
    phones: "phones",
    cctv: "cctv",
    trackers: "trackers",
    "tv-news": "tv news",
    bank: "bank",
    "hq-monitors": "hq monitors",
  },
}

export const DEVICE_LABELS: Record<Locale, Record<DeviceType, string>> = {
  ru: {
    phone: "телефон",
    monitor: "монитор",
    tv: "тв",
    tablet: "планшет",
    projector: "проектор",
    cctv: "камера",
  },
  en: {
    phone: "phone",
    monitor: "monitor",
    tv: "tv",
    tablet: "tablet",
    projector: "projector",
    cctv: "cctv",
  },
}

export const STATUS_LABELS: Record<Locale, Record<InsertStatus, string>> = {
  ru: {
    draft: "черновик",
    ready: "готово",
    "needs review": "на проверку",
    shooting: "съёмка",
  },
  en: {
    draft: "draft",
    ready: "ready",
    "needs review": "needs review",
    shooting: "shooting",
  },
}

export const MODE_LABELS: Record<Locale, Record<PlaybackMode, string>> = {
  ru: { clean: "чистый", filmed: "съёмка с экрана", dirty: "грязный" },
  en: { clean: "clean", filmed: "filmed", dirty: "dirty" },
}

export const MODE_NOTES: Record<Locale, Record<PlaybackMode, string>> = {
  ru: {
    clean: "чёткий сгенерированный кадр-источник",
    filmed: "съёмка с экрана: муар, блум, отражения",
    dirty: "грязное воспроизведение: компрессия, артефакты cctv, выпавшие кадры",
  },
  en: {
    clean: "crisp generated source frame",
    filmed: "filmed from screen: moiré, bloom, reflections",
    dirty: "dirty playback: compression, cctv artifacts, dropped frames",
  },
}

export const categoryLabel = (id: CategoryId, locale: Locale) =>
  CATEGORY_LABELS[locale][id]
export const deviceLabel = (id: DeviceType, locale: Locale) =>
  DEVICE_LABELS[locale][id]
export const statusLabel = (id: InsertStatus, locale: Locale) =>
  STATUS_LABELS[locale][id]
export const modeLabel = (id: PlaybackMode, locale: Locale) =>
  MODE_LABELS[locale][id]
export const modeNote = (id: PlaybackMode, locale: Locale) =>
  MODE_NOTES[locale][id]
