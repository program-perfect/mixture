import type {
  BuiltInCategoryId,
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
  "section.style": "оформление",
  "section.about": "для души",
  "nav.appearance": "оформление",
  "nav.metadata": "метаданные",
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

  // timeline
  "timeline.title": "производственный таймлайн",
  "timeline.desc":
    "все вставки сгруппированы по сериям и сценам в порядке съёмки. нажмите строку, чтобы загрузить её в превью устройства.",

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
  "style.sw.background": "фон",
  "style.sw.panel": "панель",
  "style.sw.controlActive": "активный контрол",
  "style.sw.accentOrange": "акцент оранжевый",
  "style.sw.accentGreen": "акцент зелёный",
  "style.sw.accentBlue": "акцент синий",
  "style.rule.1":
    "везде моноширинн������й шрифт, подписи строчными. интерфейс читается как терминал, а не как буклет.",
  "style.rule.2":
    "обобщённый, небрендированный корпус устройства. никогда не воспроизводите реальный продукт или логотип.",
  "style.rule.3":
    "каждая вставка грейдится под кадр: чистая, съёмка с экрана или грязная.",
  "style.rule.4":
    "минимум интерфейса на площадке — только тихая плавающая кнопка, без хедера и футера.",
  "style.rule.5":
    "полноэкранный режим по умолчанию. скрин-стейт — это весь кадр.",

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

  // licenses
  "licenses.title": "лицензии и права",
  "licenses.desc":
    "полный список прямых зависимостей проекта с их лицензиями. список и тексты лицензий собираются автоматически из node_modules при запуске и сборке — при установке новых модулей он обновляется сам.",
  "licenses.search": "поиск по названию или лицензии…",
  "licenses.packages": "пакетов",
  "licenses.directDeps": "прямые зависимости",
  "licenses.loading": "загрузка текста лицензии…",
  "licenses.unavailable": "текст лицензии недоступен.",
  "licenses.empty": "ничего не найдено.",

  // floating menu
  "fm.back": "к предпросмотру",
  "fm.fullscreen": "полный экран",
  "fm.exitFullscreen": "выйти из полного экрана",
  "fm.rotate": "повернуть",
  "fm.landscape": "альбомная",
  "fm.portrait": "книжная",
  "fm.revealExit": "меню: выход из полного экрана",
  "fm.revealHotkey": "меню: клавиша «m»",
  "fm.revealHintExit": "выйдите из полного экрана, чтобы показать меню",
  "fm.revealHintKey": "нажмите «m», чтобы показать меню",

  // shared
  "common.copy": "копировать",
  "common.copied": "скопировано",
  "common.ruOnly": "только ru",
  "common.ruOnlyHint": "английский перевод не добавлен",

  // library editor
  "editor.addInsert": "добавить вставку",
  "editor.addCategory": "добавить категорию",
  "editor.reset": "сбросить библиотеку",
  "editor.newInsert": "новая вставка",
  "editor.newInsertDesc":
    "сохраняется на сайте и видна всем. поля на английском необязательны.",
  "editor.newCategory": "новая категория",
  "editor.newCategoryDesc":
    "категории общие для всей библиотеки и сохраняются на сайте.",
  "editor.labelRu": "название (ru)",
  "editor.labelEn": "название (en)",
  "editor.labelRuPh": "напр. дроны",
  "editor.labelEnPh": "напр. drones",
  "editor.titleRu": "заголовок (ru)",
  "editor.titleEn": "заголовок (en)",
  "editor.titleRuPh": "напр. экран блокировки телефона",
  "editor.titleEnPh": "напр. phone lock screen",
  "editor.slug": "слаг (адрес)",
  "editor.slugHint": "необязательно, латиница",
  "editor.slugPh": "напр. phone-lock-screen",
  "editor.aspect": "формат кадра",
  "editor.episode": "серия",
  "editor.scene": "сцена",
  "editor.date": "дата",
  "editor.description": "описание",
  "editor.prompt": "промпт",
  "editor.shortPrompt": "короткий промпт",
  "editor.negativePrompt": "негативный промпт",
  "editor.optional": "необязательно",
  "editor.required": "заполните обязательные поля",
  "editor.save": "сохранить",
  "editor.cancel": "отмена",
  "editor.resetTitle": "сбросить библиотеку?",
  "editor.resetDesc":
    "все добавленные вставки и категории будут удалены. встроенный список вернётся к исходному состоянию.",
  "editor.resetConfirm": "сбросить",

  // appearance / theme
  "theme.mode": "режим",
  "theme.dark": "тёмная",
  "theme.light": "светлая",
  "theme.system": "системная",
  "theme.palette": "палитра",
  "theme.paletteDesc": "набор акцентных цветов интерфейса.",
  "theme.modeDesc": "светлая и тёмная схемы в стиле cobalt.tools.",
  "palette.cobalt": "кобальт",
  "palette.sunset": "закат",
  "palette.forest": "лес",
  "palette.mono": "моно",

  // motion / accessibility
  "motion.title": "движение",
  "motion.desc":
    "плавные переходы, анимации появления и скелетоны при загрузке. уменьшите движение, если анимации мешают или устройство тормозит.",
  "motion.auto": "авто",
  "motion.full": "включено",
  "motion.reduced": "уменьшено",
  "motion.autoNoteOn":
    "авто: движение уменьшено — так просит система или устройство недостаточно мощное.",
  "motion.autoNoteOff": "авто: анимации включены по предпочтениям системы.",
  "motion.manualOn": "движение уменьшено вручную.",
  "motion.manualOff": "анимации включены вручную.",
}

const EN: Dict = {
  "project.name": "screen inserts",

  "section.overview": "overview",
  "section.library": "library",
  "section.preview": "preview",
  "section.timeline": "timeline",
  "section.prompts": "prompts",
  "section.style": "appearance",
  "section.about": "info for nerds",
  "nav.appearance": "appearance",
  "nav.metadata": "metadata",
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

  "timeline.title": "production timeline",
  "timeline.desc":
    "every insert grouped by episode and scene, in shooting order. tap a row to load it into the device preview.",

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
  "style.sw.background": "background",
  "style.sw.panel": "panel",
  "style.sw.controlActive": "control active",
  "style.sw.accentOrange": "accent orange",
  "style.sw.accentGreen": "accent green",
  "style.sw.accentBlue": "accent blue",
  "style.rule.1":
    "monospace everywhere, lowercase labels. interface reads like a terminal, not a brochure.",
  "style.rule.2":
    "generic, unbranded device chrome. never reproduce a real product or logo.",
  "style.rule.3":
    "every insert is graded for the shot: clean, filmed-from-screen, or dirty playback.",
  "style.rule.4":
    "minimal chrome on set — only a quiet floating control, never a header or footer.",
  "style.rule.5":
    "fullscreen by default. the screen-state is the whole frame.",

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

  "licenses.title": "licenses & rights",
  "licenses.desc":
    "the full list of the project's direct dependencies with their licenses. the list and license texts are collected automatically from node_modules on dev start and build — installing new modules refreshes it on its own.",
  "licenses.search": "search by name or license…",
  "licenses.packages": "packages",
  "licenses.directDeps": "direct dependencies",
  "licenses.loading": "loading license text…",
  "licenses.unavailable": "license text unavailable.",
  "licenses.empty": "nothing found.",

  "fm.back": "back to preview",
  "fm.fullscreen": "fullscreen",
  "fm.exitFullscreen": "exit fullscreen",
  "fm.rotate": "rotate",
  "fm.landscape": "landscape",
  "fm.portrait": "portrait",
  "fm.revealExit": "menu: exit fullscreen",
  "fm.revealHotkey": "menu: press “m”",
  "fm.revealHintExit": "exit fullscreen to show the menu",
  "fm.revealHintKey": "press “m” to show the menu",

  "common.copy": "copy",
  "common.copied": "copied",
  "common.ruOnly": "ru only",
  "common.ruOnlyHint": "english translation not added",

  // library editor
  "editor.addInsert": "add insert",
  "editor.addCategory": "add category",
  "editor.reset": "reset library",
  "editor.newInsert": "new insert",
  "editor.newInsertDesc":
    "saved on the site and visible to everyone. english fields are optional.",
  "editor.newCategory": "new category",
  "editor.newCategoryDesc":
    "categories are shared across the whole library and saved on the site.",
  "editor.labelRu": "label (ru)",
  "editor.labelEn": "label (en)",
  "editor.labelRuPh": "e.g. дроны",
  "editor.labelEnPh": "e.g. drones",
  "editor.titleRu": "title (ru)",
  "editor.titleEn": "title (en)",
  "editor.titleRuPh": "e.g. экран блокировки телефона",
  "editor.titleEnPh": "e.g. phone lock screen",
  "editor.slug": "slug (url)",
  "editor.slugHint": "optional, latin only",
  "editor.slugPh": "e.g. phone-lock-screen",
  "editor.aspect": "aspect ratio",
  "editor.episode": "episode",
  "editor.scene": "scene",
  "editor.date": "date",
  "editor.description": "description",
  "editor.prompt": "prompt",
  "editor.shortPrompt": "short prompt",
  "editor.negativePrompt": "negative prompt",
  "editor.optional": "optional",
  "editor.required": "fill in the required fields",
  "editor.save": "save",
  "editor.cancel": "cancel",
  "editor.resetTitle": "reset library?",
  "editor.resetDesc":
    "all added inserts and categories will be removed. the built-in list returns to its original state.",
  "editor.resetConfirm": "reset",

  // appearance / theme
  "theme.mode": "mode",
  "theme.dark": "dark",
  "theme.light": "light",
  "theme.system": "system",
  "theme.palette": "palette",
  "theme.paletteDesc": "the set of interface accent colors.",
  "theme.modeDesc": "light and dark schemes in the cobalt.tools style.",
  "palette.cobalt": "cobalt",
  "palette.sunset": "sunset",
  "palette.forest": "forest",
  "palette.mono": "mono",

  // motion / accessibility
  "motion.title": "motion",
  "motion.desc":
    "smooth transitions, enter animations and loading skeletons. reduce motion if animations get in the way or the device feels slow.",
  "motion.auto": "auto",
  "motion.full": "on",
  "motion.reduced": "reduced",
  "motion.autoNoteOn":
    "auto: motion reduced — the system asks for it or the device looks underpowered.",
  "motion.autoNoteOff": "auto: animations on, following the system preference.",
  "motion.manualOn": "motion reduced manually.",
  "motion.manualOff": "animations enabled manually.",
}

const DICT: Record<Locale, Dict> = { ru: RU, en: EN }

export function translate(locale: Locale, key: string): string {
  return DICT[locale][key] ?? DICT.ru[key] ?? key
}

/* ----------------------- localized entity labels ----------------------- */

export const CATEGORY_LABELS: Record<
  Locale,
  Record<BuiltInCategoryId, string>
> = {
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
  CATEGORY_LABELS[locale][id as BuiltInCategoryId] ??
  CATEGORY_LABELS.ru[id as BuiltInCategoryId] ??
  id
export const deviceLabel = (id: DeviceType, locale: Locale) =>
  DEVICE_LABELS[locale][id]
export const statusLabel = (id: InsertStatus, locale: Locale) =>
  STATUS_LABELS[locale][id]
export const modeLabel = (id: PlaybackMode, locale: Locale) =>
  MODE_LABELS[locale][id]
export const modeNote = (id: PlaybackMode, locale: Locale) =>
  MODE_NOTES[locale][id]
