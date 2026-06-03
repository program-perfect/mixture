import type {
  AspectRatio,
  CategoryId,
  DeviceType,
  Insert,
  InsertStatus,
  Locale,
  LocalizedList,
  LocalizedText,
  PlaybackMode,
  ResolvedInsert,
} from "./types"

export const PROJECT_VERSION = "v0.9-gs-screenkit"
export const PROJECT_SUBTITLE = "гремучая смесь / prop playback system"

export type CategoryMeta = {
  id: CategoryId
  accent: string
  tint: string
}

export const CATEGORIES: CategoryMeta[] = [
  { id: "phones", accent: "var(--accent-orange)", tint: "rgba(255,159,28,0.14)" },
  { id: "cctv", accent: "var(--accent-red)", tint: "rgba(239,71,111,0.14)" },
  { id: "trackers", accent: "var(--accent-purple)", tint: "rgba(108,99,255,0.16)" },
  { id: "tv-news", accent: "var(--accent-blue)", tint: "rgba(47,128,237,0.14)" },
  { id: "bank", accent: "var(--accent-green)", tint: "rgba(34,197,94,0.14)" },
  { id: "hq-monitors", accent: "var(--accent-cyan)", tint: "rgba(76,201,240,0.14)" },
]

export const categoryMeta = (id: CategoryId): CategoryMeta =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0]

export const DEVICES: { id: DeviceType; aspect: AspectRatio }[] = [
  { id: "phone", aspect: "9:16" },
  { id: "monitor", aspect: "16:9" },
  { id: "tv", aspect: "16:9" },
  { id: "tablet", aspect: "16:10" },
  { id: "projector", aspect: "16:9" },
  { id: "cctv", aspect: "4:3" },
]

export const PLAYBACK_MODES: { id: PlaybackMode }[] = [
  { id: "clean" },
  { id: "filmed" },
  { id: "dirty" },
]

export const STATUSES: { id: InsertStatus; accent: string }[] = [
  { id: "draft", accent: "var(--text-muted)" },
  { id: "ready", accent: "var(--accent-green)" },
  { id: "needs review", accent: "var(--accent-orange)" },
  { id: "shooting", accent: "var(--accent-red)" },
]

export const statusAccent = (s: InsertStatus): string =>
  STATUSES.find((x) => x.id === s)?.accent ?? "var(--text-muted)"

/* ------------------------------- resolvers ------------------------------- */

export const pick = (t: LocalizedText, locale: Locale): string =>
  locale === "en" ? t.en ?? t.ru : t.ru

export const pickList = (l: LocalizedList, locale: Locale): string[] =>
  locale === "en" ? l.en ?? l.ru : l.ru

export const hasEnglish = (insert: Insert): boolean =>
  typeof insert.title.en === "string"

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
  }
}

/* --------------------------------- data --------------------------------- */

export const INSERTS: Insert[] = [
  {
    id: "gs-001",
    date: "2025-03-04",
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
  {
    id: "gs-002",
    date: "2025-03-05",
    episode: "ep.01",
    scene: "sc.22",
    category: "hq-monitors",
    device: "monitor",
    aspect: "16:9",
    status: "shooting",
    title: { ru: "таймер 00:01 → 00:00", en: "timer 00:01 → 00:00" },
    description: {
      ru: "вставка обратного отсчёта для сцены детонации. красные семисегментные цифры тикают с 00:01 до 00:00.",
      en: "countdown insert for the detonation beat. seven-segment red digits ticking from 00:01 to 00:00.",
    },
    prompt: {
      ru: "крупный план красного семисегментного дисплея обратного отсчёта, тикающего с 00:01 до 00:00, чёрный фон, лёгкий блум crt, малая глубина резкости, напряжённая криминальная вставка, бледное отражение на стекле, без элементов ui",
      en: "extreme close-up of a red seven-segment countdown display ticking 00:01 to 00:00, black background, slight crt bloom, shallow focus, tense crime thriller insert, faint reflection on glass, no UI chrome",
    },
    shortPrompt: {
      ru: "красный 7-сегментный отсчёт 00:01→00:00, блум crt, чёрный фон",
      en: "red 7-seg countdown 00:01→00:00, crt bloom, black bg",
    },
    negativePrompt: {
      ru: "красочный, игривый, день, мягкие пастельные тона, чистый вектор",
      en: "colorful, playful, daytime, soft pastel, clean vector",
    },
    technicalNotes: {
      ru: [
        "семисегментный красный, отражение на стекле",
        "финал лупа должен остановиться на 00:00",
        "лёгкий блум crt в режиме съёмки",
      ],
      en: [
        "seven-segment red, glass reflection",
        "loop endpoint must rest on 00:00",
        "subtle crt bloom in filmed mode",
      ],
    },
  },
  {
    id: "gs-003",
    date: "2025-03-06",
    episode: "ep.02",
    scene: "sc.03",
    category: "hq-monitors",
    device: "monitor",
    aspect: "16:9",
    status: "ready",
    title: {
      ru: "монитор оперативного штаба",
      en: "operational headquarters monitor",
    },
    description: {
      ru: "ситуационный монитор оперативной группы: сетка подозреваемых, плитка живой карты, бегущая строка по делу снизу.",
      en: "task-force situation monitor: suspect grid, live map tile, case ticker along the bottom.",
    },
    prompt: {
      ru: "настенный монитор оперативного штаба полиции, тёмный ситуационный дашборд, сетка размытых портретов подозреваемых, схематичная плитка карты города, бегущая строка по делу, приглушённый сине-серый ui, моноширинные подписи, бледный блик экрана, реквизит русского криминального сериала",
      en: "police operational headquarters wall monitor, dark situation dashboard, grid of blurred suspect portraits, schematic city map tile, scrolling case ticker, muted blue-grey UI, monospace labels, faint screen glare, russian crime series prop",
    },
    shortPrompt: {
      ru: "ситуационный монитор штаба, сетка подозреваемых + карта, моно ui",
      en: "task-force situation monitor, suspect grid + map, mono UI",
    },
    negativePrompt: {
      ru: "потребительское приложение, яркий saas-градиент, дружелюбные иконки",
      en: "consumer app, bright saas gradient, friendly icons",
    },
    technicalNotes: {
      ru: [
        "монитор 16:9, лёгкий блик под углом",
        "подписи в кириллице-совместимом моно",
        "плитка карты схематичная, не реальный провайдер",
      ],
      en: [
        "16:9 monitor, slight off-axis glare",
        "labels in cyrillic-compatible mono",
        "map tile schematic, not a real provider",
      ],
    },
  },
  {
    id: "gs-004",
    date: "2025-03-07",
    episode: "ep.02",
    scene: "sc.11",
    category: "cctv",
    device: "cctv",
    aspect: "4:3",
    status: "needs review",
    title: { ru: "монитор cctv магазина", en: "store cctv monitor" },
    description: {
      ru: "охранный монитор магазина у дома с квадро-видом, четыре плитки камер, ночной таймстамп.",
      en: "convenience-store quad-view security monitor, four camera tiles, night timestamp.",
    },
    prompt: {
      ru: "охранный монитор магазина у дома, разбитый на четыре плитки cctv, 4:3, зелёно-серое ночное видение, таймстамп на каждой плитке, низкая частота кадров, сильные блоки компрессии, пустые ряды, грязная вставка наблюдения",
      en: "convenience store security monitor split into four cctv tiles, 4:3, green-grey night vision, timestamp per tile, low frame rate, heavy compression blocks, empty aisles, gritty surveillance insert",
    },
    shortPrompt: {
      ru: "квадро-cctv магазина, 4 плитки, ночь, низкий fps",
      en: "store quad cctv, 4 tiles, night, low fps",
    },
    negativePrompt: {
      ru: "резкий, цвет, кинематографичный свет, один чистый кадр",
      en: "crisp, color, cinematic lighting, single clean shot",
    },
    technicalNotes: {
      ru: ["квадро-разбивка 2x2", "таймстамп + id камеры на каждой плитке", "макроблочная компрессия в грязном режиме"],
      en: ["quad split 2x2", "per-tile timestamp + cam id", "macroblock compression in dirty mode"],
    },
  },
  {
    id: "gs-005",
    date: "2025-03-08",
    episode: "ep.02",
    scene: "sc.27",
    category: "tv-news",
    device: "tv",
    aspect: "16:9",
    status: "ready",
    title: { ru: "криминальные новости на старом тв", en: "old tv crime news" },
    description: {
      ru: "сюжет региональных вечерних новостей о деле, бегущая строка снизу, логотип канала.",
      en: "regional evening news segment about the case, lower-third ticker, channel bug.",
    },
    prompt: {
      ru: "региональные русские криминальные тв-новости на старом телевизоре, размытый стол ведущего, красная плашка «срочно» снизу, бегущая строка, логотип канала справа вверху, лёгкая кривизна и блум crt, отражение при съёмке с экрана",
      en: "regional russian tv crime news broadcast on an old set, anchor desk blurred, red breaking-news lower third, scrolling ticker, channel logo bug top-right, slight crt curvature and bloom, filmed-from-screen reflection",
    },
    shortPrompt: {
      ru: "криминальные новости на старом тв, красная плашка, блум crt",
      en: "old tv crime news, breaking lower-third, crt bloom",
    },
    negativePrompt: {
      ru: "чистый 4k, современный стриминговый ui, плоский дизайн",
      en: "4k clean, modern streaming UI, flat design",
    },
    technicalNotes: {
      ru: ["кривизна + блум crt", "красная плашка снизу, бегущая строка", "логотип канала справа вверху"],
      en: ["crt curvature + bloom", "lower third red, ticker scroll", "channel bug top-right"],
    },
  },
  {
    id: "gs-006",
    date: "2025-03-10",
    episode: "ep.03",
    scene: "sc.05",
    category: "bank",
    device: "monitor",
    aspect: "16:9",
    status: "draft",
    title: { ru: "интернет-перевод в банке", en: "internet bank transfer" },
    description: {
      ru: "экран подтверждения банковского перевода онлайн, крупная сумма, замаскированный счёт, спиннер прогресса.",
      en: "online banking transfer confirmation screen, large sum, masked account, progress spinner.",
    },
    prompt: {
      ru: "страница подтверждения банковского перевода в ноутбуке, крупные замаскированные номера счетов, поле суммы перевода, зелёное состояние подтверждения, минималистичный корпоративный банковский ui, бледное отражение экрана, без реального бренда, реквизитная вставка криминального сериала",
      en: "online banking transfer confirmation page on a laptop, large masked account numbers, transfer amount field, green confirm state, minimal corporate bank UI, faint screen reflection, no real brand, crime series prop insert",
    },
    shortPrompt: {
      ru: "экран подтверждения перевода, замаскированный счёт, крупная сумма",
      en: "bank transfer confirm screen, masked account, large sum",
    },
    negativePrompt: {
      ru: "реальный логотип банка, название бренда, игривые цвета",
      en: "real bank logo, brand name, playful colors",
    },
    technicalNotes: {
      ru: ["вымышленный банк, без реального бренда", "маскировать всё, кроме последних 4 цифр", "зелёный акцент подтверждения"],
      en: ["fictional bank, no real brand", "mask all but last 4 digits", "green confirm accent"],
    },
  },
  {
    id: "gs-007",
    date: "2025-03-11",
    episode: "ep.03",
    scene: "sc.18",
    category: "hq-monitors",
    device: "monitor",
    aspect: "16:9",
    status: "needs review",
    title: { ru: "удалённая сессия ноутбука", en: "remote laptop session" },
    description: {
      ru: "удалённый рабочий стол / vnc-вид целевой машины, командный терминал, артефакты низкой частоты обновления.",
      en: "remote desktop / VNC view of a target machine, command terminal, low refresh artifacts.",
    },
    prompt: {
      ru: "окно сессии удалённого рабочего стола, управляющее целевым ноутбуком, терминал с прокручивающимися командами, разрывы при низкой частоте обновления, бейдж задержки соединения, тёмный, близкий к хакерскому, но реалистичный ui, моноширинный, лёгкая компрессия",
      en: "remote desktop session window controlling a target laptop, terminal with scrolling commands, low refresh tearing, connection latency badge, dark hacker-adjacent but realistic UI, monospace, faint compression",
    },
    shortPrompt: {
      ru: "удалённый рабочий стол / vnc, терминал, разрывы задержки",
      en: "remote desktop / VNC session, terminal, latency tearing",
    },
    negativePrompt: {
      ru: "дождь из матрицы, неоновый киберпанк, фальшивый голливудский взлом",
      en: "matrix rain, neon cyberpunk, fake hollywood hacking",
    },
    technicalNotes: {
      ru: ["реалистичный интерфейс удалённого стола", "задержка + разрывы в грязном режиме", "моно-терминал"],
      en: ["realistic remote-desktop chrome", "latency + tearing in dirty mode", "mono terminal"],
    },
  },
  {
    id: "gs-008",
    date: "2025-03-12",
    episode: "ep.04",
    scene: "sc.02",
    category: "phones",
    device: "phone",
    aspect: "9:16",
    status: "ready",
    title: { ru: "экраны звонка смартфона", en: "smartphone call screens" },
    description: {
      ru: "ui входящего / активного звонка на телефоне, неизвестный абонент, счётчик длительности.",
      en: "incoming / active call UI on a phone, unknown caller, duration counter.",
    },
    prompt: {
      ru: "экран входящего звонка смартфона, неизвестный номер, крупный плейсхолдер аватара, кнопки принять/отклонить, затем активный звонок с таймером длительности, чистый мобильный ui, 9:16, обобщённый вид ос, реквизит криминального сериала",
      en: "smartphone incoming call screen, unknown number, large avatar placeholder, accept/decline buttons, then active call with duration timer, clean mobile UI, 9:16, generic OS look, crime series prop",
    },
    shortPrompt: {
      ru: "ui звонка телефона, неизвестный абонент, таймер, 9:16",
      en: "phone call UI, unknown caller, duration timer, 9:16",
    },
    negativePrompt: {
      ru: "реальный бренд ос, логотипы ios/android, игривые стикеры",
      en: "real OS brand, ios/android logos, playful stickers",
    },
    technicalNotes: {
      ru: ["рамка телефона 9:16", "обобщённая ос, без бренда", "показать состояния входящего + активного"],
      en: ["9:16 phone frame", "generic OS, no brand", "show incoming + active states"],
    },
  },
  {
    id: "gs-009",
    date: "2025-03-12",
    episode: "ep.04",
    scene: "sc.09",
    category: "phones",
    device: "phone",
    aspect: "9:16",
    status: "ready",
    title: { ru: "смс / мессенджер", en: "sms / messenger" },
    description: {
      ru: "угрожающая переписка в мессенджере, галочки доставлено/прочитано, индикатор набора, скрытые имена.",
      en: "threatening messenger thread, delivered/seen ticks, typing indicator, redacted names.",
    },
    prompt: {
      ru: "переписка в телефонном мессенджере, короткие угрожающие сообщения на кириллице, галочки доставлено и прочитано, пузырь индикатора набора, скрытое имя контакта, обобщённый чат-ui, 9:16, реквизитная вставка криминального сериала",
      en: "phone messenger conversation thread, short threatening messages in cyrillic, delivered and seen ticks, typing indicator bubble, redacted contact name, generic chat UI, 9:16, crime series prop insert",
    },
    shortPrompt: {
      ru: "переписка в мессенджере, угрозы, галочки, 9:16",
      en: "messenger thread, threatening texts, ticks, 9:16",
    },
    negativePrompt: {
      ru: "точный брендинг whatsapp/telegram, эмодзи повсюду",
      en: "whatsapp/telegram exact branding, emojis everywhere",
    },
    technicalNotes: {
      ru: ["обобщённый чат-ui", "галочки доставлено/прочитано", "скрытый контакт"],
      en: ["generic chat UI", "delivered/seen ticks", "redacted contact"],
    },
  },
  {
    id: "gs-010",
    date: "2025-03-13",
    episode: "ep.04",
    scene: "sc.31",
    category: "phones",
    device: "phone",
    aspect: "9:16",
    status: "draft",
    title: { ru: "видеозвонок с тропического острова", en: "tropical island avatar call" },
    description: {
      ru: "видеозвонок мужчине на фоне тропического острова, самодовольный, плохое соединение.",
      en: "video call to a man with a tropical island background, smug, poor connection.",
    },
    prompt: {
      ru: "видеозвонок на телефоне мужчине, сидящему на фоне яркого тропического острова, плохое соединение с блочной компрессией, моменты замороженного кадра, шкала сигнала, обобщённый ui звонка, 9:16, ироничная вставка криминального сериала",
      en: "video call on a phone to a man sitting against a bright tropical island background, poor connection blocky compression, frozen frame moments, connection bars, generic call UI, 9:16, ironic crime series insert",
    },
    shortPrompt: {
      ru: "видеозвонок, фон тропического острова, плохая связь, 9:16",
      en: "video call, tropical island bg, bad connection, 9:16",
    },
    negativePrompt: {
      ru: "студийное качество вебкамеры, идеальный свет",
      en: "studio quality webcam, perfect lighting",
    },
    technicalNotes: {
      ru: ["заморозка кадра при потере пакетов", "вспышки блочной компрессии", "яркий тропический контраст против тёмного ui"],
      en: ["freeze-frame on dropped packets", "blocky compression bursts", "bright tropical contrast vs dark UI"],
    },
  },
  {
    id: "gs-011",
    date: "2025-03-14",
    episode: "ep.05",
    scene: "sc.04",
    category: "trackers",
    device: "tablet",
    aspect: "16:10",
    status: "shooting",
    title: { ru: "гео-трекер с пульсирующей красной точкой", en: "geo tracker with pulsing red dot" },
    description: {
      ru: "живая карта gps-трекера, одна пульсирующая красная точка цели движется по маршруту, hud с координатами.",
      en: "live GPS tracker map, single pulsing red target dot moving along a route, coordinates HUD.",
    },
    prompt: {
      ru: "интерфейс gps-слежения на планшете, тёмная схематичная карта, одна пульсирующая красная точка цели следует по линии маршрута, hud живых координат, показания скорости и курса, моноширинный, вид инструмента наблюдения, 16:10",
      en: "gps tracking interface on a tablet, dark schematic map, single pulsing red target dot following a route line, live coordinates HUD, speed and heading readout, monospace, surveillance tool look, 16:10",
    },
    shortPrompt: {
      ru: "gps-трекер, пульсирующая красная точка на маршруте, hud координат, 16:10",
      en: "gps tracker, pulsing red dot on route, coords HUD, 16:10",
    },
    negativePrompt: {
      ru: "брендинг google maps, красочная потребительская карта",
      en: "google maps branding, colorful consumer map",
    },
    technicalNotes: {
      ru: ["анимация пульсирующей красной точки", "схематичная карта, без реального провайдера", "координаты + скорость в моно hud"],
      en: ["pulsing red dot animation", "schematic map, no real provider", "coords + speed HUD mono"],
    },
  },
  {
    id: "gs-012",
    date: "2025-03-15",
    episode: "ep.05",
    scene: "sc.19",
    category: "hq-monitors",
    device: "monitor",
    aspect: "16:9",
    status: "ready",
    title: { ru: "карточки ориентировок в розыске", en: "wanted bulletin cards" },
    description: {
      ru: "доска ориентировок разыскиваемых на мониторе, карточки с фото, флаги статуса, номера дел.",
      en: "wanted-persons bulletin board on a monitor, mugshot cards, status flags, case numbers.",
    },
    prompt: {
      ru: "полицейская сводка разыскиваемых на мониторе, сетка карточек с фотографиями, номерами дел и красными флагами статуса, тёмный ui базы данных, моноширинные подписи, бледный блик, реквизитная вставка русского криминального сериала",
      en: "police wanted-persons bulletin on a monitor, grid of mugshot cards with case numbers and red status flags, dark database UI, monospace labels, faint glare, russian crime series prop insert",
    },
    shortPrompt: {
      ru: "карточки ориентировок, фото + флаги, тёмный ui бд",
      en: "wanted bulletin cards, mugshots + flags, dark DB UI",
    },
    negativePrompt: {
      ru: "реальные люди, реальные логотипы полиции, светлая тема",
      en: "real persons, real police logos, bright theme",
    },
    technicalNotes: {
      ru: ["только сгенерированные лица", "номера дел в моно", "красные флаги статуса"],
      en: ["generated faces only", "case numbers mono", "red status flags"],
    },
  },
  {
    id: "gs-013",
    date: "2025-03-16",
    episode: "ep.06",
    scene: "sc.07",
    category: "phones",
    device: "tablet",
    aspect: "16:10",
    status: "needs review",
    title: { ru: "галерея планшета / фото по делу", en: "tablet gallery / case photos" },
    description: {
      ru: "галерея фото-улик по делу на планшете, сетка миниатюр, свайп к увеличенному фото.",
      en: "case-evidence photo gallery on a tablet, thumbnail grid, swipe to enlarged photo.",
    },
    prompt: {
      ru: "галерея фотографий улик по делу на планшете, сетка миниатюр, затем увеличенное фото с места преступления, полоса метаданных в стиле exif, тёмный ui галереи, 16:10, отпечатки пальцев на стекле в режиме съёмки, реквизит криминального сериала",
      en: "tablet photo gallery of case evidence, thumbnail grid then enlarged crime-scene photo, exif-style metadata strip, dark gallery UI, 16:10, fingerprints on glass in filmed mode, crime series prop",
    },
    shortPrompt: {
      ru: "галерея улик на планшете, сетка + увеличенное фото, 16:10",
      en: "tablet evidence gallery, grid + enlarged photo, 16:10",
    },
    negativePrompt: {
      ru: "отпускные фото, яркая весёлая галерея",
      en: "vacation photos, bright cheerful gallery",
    },
    technicalNotes: {
      ru: ["полоса метаданных в стиле exif", "отпечатки/блики в режиме съёмки", "сгенерированные изображения улик"],
      en: ["exif-style metadata strip", "fingerprints/glare in filmed mode", "generated evidence imagery"],
    },
  },
  {
    id: "gs-014",
    date: "2025-03-18",
    episode: "ep.06",
    scene: "sc.24",
    category: "cctv",
    device: "cctv",
    aspect: "4:3",
    status: "ready",
    title: { ru: "cctv чайханы шавката", en: "shavkat tea-house cctv" },
    description: {
      ru: "наблюдение в чайхане, тёплый интерьер, посетители за низкими столиками, фиксированный угол.",
      en: "tea-house surveillance, warm interior, patrons at low tables, fixed corner angle.",
    },
    prompt: {
      ru: "cctv интерьера среднеазиатской чайханы, тёплый тусклый свет, посетители за низкими столиками, фиксированный высокий угол, 4:3, таймстамп поверх, лёгкая компрессия, выпавшие кадры, грязная вставка наблюдения",
      en: "cctv of a central asian tea-house interior, warm dim lighting, patrons at low tables, fixed high corner angle, 4:3, timestamp overlay, mild compression, dropped frames, gritty surveillance insert",
    },
    shortPrompt: {
      ru: "cctv чайханы, тёплый интерьер, угол, 4:3",
      en: "tea-house cctv, warm interior, corner angle, 4:3",
    },
    negativePrompt: {
      ru: "кинематографичный долли, цветокоррекция, резкий 4k",
      en: "cinematic dolly, color graded, crisp 4k",
    },
    technicalNotes: {
      ru: ["фиксированный угол", "тёплый вольфрамовый оттенок под шумом cctv", "таймстамп поверх"],
      en: ["fixed corner angle", "warm tungsten tint under cctv noise", "timestamp overlay"],
    },
  },
  {
    id: "gs-015",
    date: "2025-03-19",
    episode: "ep.07",
    scene: "sc.05",
    category: "cctv",
    device: "monitor",
    aspect: "16:9",
    status: "draft",
    title: { ru: "монитор охранного поста особняка", en: "mansion guard post monitor" },
    description: {
      ru: "монитор охранного поста у ворот особняка, мульти-камеры периметра, плитки ворот + подъездной дороги.",
      en: "guard-post monitor at a mansion gate, multi-cam perimeter, gate + driveway tiles.",
    },
    prompt: {
      ru: "монитор охранного поста особняка, плитки cctv периметра — ворота, подъездная дорога и сад, 16:9, ночной ик-оттенок на части плиток, таймстампы, низкий fps, грязная реквизитная вставка наблюдения",
      en: "mansion security guard post monitor, perimeter cctv tiles of gate, driveway and garden, 16:9, night ir tint on some tiles, timestamps, low fps, gritty surveillance prop insert",
    },
    shortPrompt: {
      ru: "монитор охраны особняка, плитки периметра, ночной ик",
      en: "mansion guard monitor, perimeter tiles, night IR",
    },
    negativePrompt: {
      ru: "один чистый кадр, дневной геройский рендер",
      en: "single clean shot, daytime hero render",
    },
    technicalNotes: {
      ru: ["смешанные дневные/ночные ик-плитки", "охват периметра", "id камеры на каждой плитке"],
      en: ["mixed day/night IR tiles", "perimeter coverage", "per-tile cam id"],
    },
  },
  {
    id: "gs-016",
    date: "2025-03-20",
    episode: "ep.07",
    scene: "sc.16",
    category: "cctv",
    device: "cctv",
    aspect: "4:3",
    status: "needs review",
    title: { ru: "наблюдение в трубном цеху" },
    description: {
      ru: "cctv промышленного объекта, длинный коридор из труб, резкий натриевый свет, одинокая фигура.",
    },
    prompt: {
      ru: "cctv промышленного объекта, длинный коридор из труб и вентилей, резкое натриево-оранжевое освещение, идёт одинокая фигура, 4:3, шум сенсора, компрессия, таймстамп, грязная вставка наблюдения",
    },
    shortPrompt: {
      ru: "cctv трубного коридора, натриевый свет, одинокая фигура",
    },
    negativePrompt: {
      ru: "чистый архитектурный рендер, сбалансированный цвет",
    },
    technicalNotes: {
      ru: ["резкий натриево-оранжевый оттенок", "глубокая перспектива коридора", "шум компрессии"],
    },
  },
  {
    id: "gs-017",
    date: "2025-03-22",
    episode: "ep.08",
    scene: "sc.02",
    category: "phones",
    device: "phone",
    aspect: "9:16",
    status: "shooting",
    title: {
      ru: "запись с заложником на заброшенной гэс",
      en: "abandoned hydro station hostage recording",
    },
    description: {
      ru: "трясущаяся вертикальная запись на телефон внутри заброшенной гидроэлектростанции, доказательство жизни заложника.",
      en: "shaky vertical phone recording inside an abandoned hydroelectric station, hostage proof-of-life.",
    },
    prompt: {
      ru: "трясущаяся вертикальная запись на телефон внутри заброшенной гидроэлектростанции, тусклый бетонный зал, луч фонарика, кадрирование доказательства жизни заложника, дрожание рук, шум при низком свете, таймстамп, 9:16, тревожная вставка криминального сериала",
      en: "shaky vertical phone recording inside an abandoned hydroelectric station, dim concrete hall, flashlight beam, hostage proof-of-life framing, handheld jitter, low light noise, timestamp, 9:16, harrowing crime series insert",
    },
    shortPrompt: {
      ru: "трясущаяся запись с заложником, бетонный зал, 9:16",
      en: "shaky phone hostage recording, concrete hall, 9:16",
    },
    negativePrompt: {
      ru: "стабилизировано, хорошо освещено, кинематографичный стедикам",
      en: "stabilized, well lit, cinematic gimbal",
    },
    technicalNotes: {
      ru: ["дрожание рук + шум при низком свете", "спад луча фонарика", "вертикаль 9:16"],
      en: ["handheld jitter + low light noise", "flashlight beam falloff", "9:16 vertical"],
    },
  },
  {
    id: "gs-018",
    date: "2025-03-23",
    episode: "ep.08",
    scene: "sc.13",
    category: "hq-monitors",
    device: "projector",
    aspect: "16:9",
    status: "ready",
    title: { ru: "экран проектора в штабе", en: "projector screen in hq" },
    description: {
      ru: "экран проектора для брифинга, карта дела и схема связей, рассеянный свет комнаты.",
      en: "briefing projector screen, case map and connections diagram, room ambient spill.",
    },
    prompt: {
      ru: "экран проектора в комнате для брифингов с диаграммой связей по делу и картой города, 16:9, лёгкое трапецеидальное искажение, засветка и низкий контраст проектора, пыль в луче, моноширинные подписи, реквизитная вставка криминального сериала",
      en: "briefing room projector screen showing a case connections diagram and city map, 16:9, slight keystone, projector light spill and low contrast, dust in beam, monospace labels, crime series prop insert",
    },
    shortPrompt: {
      ru: "проектор штаба, диаграмма связей, трапеция",
      en: "hq projector briefing, connections diagram, keystone",
    },
    negativePrompt: {
      ru: "высококонтрастный монитор, резкие пиксели, яркий насыщенный",
      en: "high contrast monitor, crisp pixels, bright saturated",
    },
    technicalNotes: {
      ru: ["трапеция + низкий контраст проектора", "засветка / вымытые чёрные", "диаграмма связей"],
      en: ["keystone + low projector contrast", "light spill / washed blacks", "connections diagram"],
    },
  },
  {
    id: "gs-019",
    date: "2025-03-24",
    episode: "ep.09",
    scene: "sc.06",
    category: "tv-news",
    device: "tv",
    aspect: "16:9",
    status: "draft",
    title: { ru: "криминальные новости в придорожном кафе" },
    description: {
      ru: "настенный тв в придорожном кафе показывает криминальные новости, окружающие отражения.",
    },
    prompt: {
      ru: "настенный телевизор в придорожном кафе показывает криминальные новости, вид через зал, отражения интерьера кафе на экране, бегущая строка снизу, лёгкий угол, эффект съёмки с экрана, вставка криминального сериала",
    },
    shortPrompt: {
      ru: "настенный тв в кафе, криминальные новости, отражения зала, под углом",
    },
    negativePrompt: {
      ru: "ровный чистый захват в лоб, без отражений",
    },
    technicalNotes: {
      ru: ["угол не в лоб", "отражения кафе на стекле", "плашка снизу + бегущая строка"],
    },
  },
  {
    id: "gs-020",
    date: "2025-03-25",
    episode: "ep.09",
    scene: "sc.21",
    category: "phones",
    device: "monitor",
    aspect: "16:9",
    status: "needs review",
    title: { ru: "видеозвонок шигорева", en: "shigorev video call" },
    description: {
      ru: "видеозвонок на десктопе с персонажем шигоревым, за ним тусклый офис, элементы управления звонком.",
      en: "desktop video call with the character Shigorev, dim office behind him, call controls.",
    },
    prompt: {
      ru: "окно видеозвонка на десктопе со строгим мужчиной средних лет (шигорев) в тусклом офисе, панель управления звонком, бейдж качества соединения, обобщённый ui конференции, лёгкая компрессия, 16:9, реквизитная вставка криминального сериала",
      en: "desktop video call window with a stern middle-aged man (shigorev) in a dim office, call controls bar, connection quality badge, generic conferencing UI, slight compression, 16:9, crime series prop insert",
    },
    shortPrompt: {
      ru: "видеозвонок на десктопе, шигорев, тусклый офис, 16:9",
      en: "desktop video call, shigorev, dim office, 16:9",
    },
    negativePrompt: {
      ru: "точный брендинг zoom/teams, яркая студия",
      en: "zoom/teams exact branding, bright studio",
    },
    technicalNotes: {
      ru: ["обобщённый ui конференции", "тусклый ключевой свет на лице", "бейдж соединения"],
      en: ["generic conferencing UI", "dim key light on subject", "connection badge"],
    },
  },
  {
    id: "gs-021",
    date: "2025-03-26",
    episode: "ep.10",
    scene: "sc.04",
    category: "cctv",
    device: "monitor",
    aspect: "4:3",
    status: "ready",
    title: { ru: "воспроизведение архива допросной", en: "interrogation-room archive playback" },
    description: {
      ru: "воспроизведение архивной записи допроса, маркер rec, полоса перемотки, камера сверху.",
      en: "archived interrogation footage played back, REC marker, scrub bar, top-down room cam.",
    },
    prompt: {
      ru: "воспроизведение архивной записи допросной, камера 4:3 сверху, подозреваемый за металлическим столом, точка rec и таймкод, полоса перемотки поверх, деградация архива в стиле vhs, грязная вставка криминального сериала",
      en: "archived interrogation room footage playback, top-down 4:3 camera, suspect at metal table, REC dot and timecode, scrub bar overlay, vhs-like archive degradation, gritty crime series insert",
    },
    shortPrompt: {
      ru: "воспроизведение архива допросной, камера сверху, rec, полоса перемотки",
      en: "interrogation archive playback, top cam, REC, scrub bar",
    },
    negativePrompt: {
      ru: "современная резкая запись, цветокоррекция",
      en: "modern crisp footage, color graded",
    },
    technicalNotes: {
      ru: ["деградация архива в стиле vhs", "точка rec + таймкод", "полоса перемотки поверх"],
      en: ["vhs-like archive degradation", "REC dot + timecode", "scrub bar overlay"],
    },
  },
  {
    id: "gs-022",
    date: "2025-03-27",
    episode: "ep.10",
    scene: "sc.17",
    category: "phones",
    device: "phone",
    aspect: "9:16",
    status: "draft",
    title: { ru: "телефон как зеркало" },
    description: {
      ru: "фронтальная камера как импровизированное зеркало, чтобы заглянуть за угол, тусклый коридор.",
    },
    prompt: {
      ru: "фронтальная камера телефона как импровизированное зеркало, чтобы заглянуть за угол, отражение тусклого коридора, сырой ui камеры, лёгкое зерно, напряжённая вставка криминального сериала, 9:16",
    },
    shortPrompt: {
      ru: "телефон-зеркало за углом, тусклый коридор, 9:16",
    },
    negativePrompt: {
      ru: "бьюти-фильтр для селфи, яркий свет",
    },
    technicalNotes: {
      ru: ["сырой ui фронтальной камеры", "зеркальное кадрирование", "зерно при низком свете"],
    },
  },
  {
    id: "gs-023",
    date: "2025-03-28",
    episode: "ep.11",
    scene: "sc.03",
    category: "phones",
    device: "phone",
    aspect: "9:16",
    status: "needs review",
    title: { ru: "футбол на умирающем телефоне", en: "dying battery football video" },
    description: {
      ru: "просмотр футбольного клипа на телефоне, пока садится батарея, предупреждение 1%, экран гаснет.",
      en: "watching a football clip on a phone as the battery dies, 1% warning, screen dims.",
    },
    prompt: {
      ru: "телефон проигрывает зернистый клип футбольного матча, батарея на 1% с красным предупреждением, авто-затемнение экрана, низкая яркость, 9:16, обобщённый ui видеоплеера, напряжённая вставка криминального сериала",
      en: "phone playing a grainy football match clip, battery at 1% red warning, screen auto-dimming, low brightness, 9:16, generic video player UI, crime series tension insert",
    },
    shortPrompt: {
      ru: "футбол на умирающем телефоне, батарея 1%, затемнение, 9:16",
      en: "football clip on dying phone, 1% battery, dimming, 9:16",
    },
    negativePrompt: {
      ru: "полная яркость, резкое вещательное качество",
      en: "full brightness, crisp broadcast quality",
    },
    technicalNotes: {
      ru: ["красное предупреждение батареи 1%", "спад авто-яркости", "зернистый клип"],
      en: ["1% red battery warning", "auto-dim brightness falloff", "grainy clip"],
    },
  },
  {
    id: "gs-024",
    date: "2025-03-29",
    episode: "ep.11",
    scene: "sc.20",
    category: "hq-monitors",
    device: "monitor",
    aspect: "16:9",
    status: "ready",
    title: { ru: "текстовый файл караева", en: "karaev text file" },
    description: {
      ru: "простой текстовый файл (karaev.txt) открыт в редакторе, выделены имена, даты и суммы.",
      en: "plain text file (karaev.txt) open in an editor, names, dates and amounts highlighted.",
    },
    prompt: {
      ru: "простой текстовый файл karaev.txt открыт в минималистичном редакторе кода, моноширинный, строки с кириллическими именами, датами и суммами, часть строк выделена, тёмная тема редактора, 16:9, реквизитная вставка криминального сериала",
      en: "plain text file karaev.txt open in a minimal code editor, monospace, lines with cyrillic names dates and amounts, some lines highlighted, dark editor theme, 16:9, crime series prop insert",
    },
    shortPrompt: {
      ru: "karaev.txt в редакторе, моно, выделенные строки",
      en: "karaev.txt in editor, mono, highlighted lines",
    },
    negativePrompt: {
      ru: "богатый текстовый процессор, красочный, изображения",
      en: "rich word processor, colorful, images",
    },
    technicalNotes: {
      ru: ["моноширинный редактор, тёмная тема", "выделить ключевые строки", "номера строк"],
      en: ["monospace editor, dark theme", "highlight key lines", "line numbers"],
    },
  },
  {
    id: "gs-025",
    date: "2025-03-30",
    episode: "ep.12",
    scene: "sc.08",
    category: "hq-monitors",
    device: "monitor",
    aspect: "16:9",
    status: "draft",
    title: { ru: "поиск по архиву соцсетей" },
    description: {
      ru: "следователь ищет в архивном профиле соцсети, сетка результатов, таймлайн постов.",
    },
    prompt: {
      ru: "следственный инструмент ищет в архивном профиле соцсети, обобщённая шапка профиля, сетка архивных постов, ползунок таймлайна, тёмный osint-ui, моноширинные метаданные, 16:9, реквизит криминального сериала",
    },
    shortPrompt: {
      ru: "инструмент поиска по архиву соцсетей, сетка постов + таймлайн",
    },
    negativePrompt: {
      ru: "реальный бренд соцсети, яркий потребительский ui",
    },
    technicalNotes: {
      ru: ["обобщённый профиль, без реального бренда", "бейдж архив/кэш", "ползунок таймлайна"],
    },
  },
  {
    id: "gs-026",
    date: "2025-03-31",
    episode: "ep.12",
    scene: "sc.22",
    category: "trackers",
    device: "tablet",
    aspect: "16:10",
    status: "shooting",
    title: { ru: "планшет-трекер бондарева", en: "bondarev tablet tracker" },
    description: {
      ru: "планшет бондарева показывает отслеживаемую цель на карте со списком «последний раз виден» и зарядом маяка.",
      en: "Bondarev's tablet showing a tracked target on a map with last-seen list and battery of beacon.",
    },
    prompt: {
      ru: "приложение слежения на планшете показывает одну отслеживаемую цель на тёмной карте, панель списка «последний раз виден», индикатор заряда маяка, пульсирующий маркер, моноширинные координаты, 16:10, вставка наблюдения криминального сериала",
      en: "tablet tracking app showing a single tracked target on a dark map, last-seen list panel, beacon battery indicator, pulsing marker, monospace coords, 16:10, surveillance crime series insert",
    },
    shortPrompt: {
      ru: "планшет-трекер бондарева, цель на карте, список последних точек",
      en: "bondarev tablet tracker, target on map, last-seen list",
    },
    negativePrompt: {
      ru: "потребительское приложение карт, красочные пины",
      en: "consumer maps app, colorful pins",
    },
    technicalNotes: {
      ru: ["панель списка «последний раз виден»", "индикатор заряда маяка", "пульсирующий маркер"],
      en: ["last-seen list panel", "beacon battery indicator", "pulsing marker"],
    },
  },
  {
    id: "gs-027",
    date: "2025-04-01",
    episode: "ep.13",
    scene: "sc.05",
    category: "trackers",
    device: "phone",
    aspect: "9:16",
    status: "needs review",
    title: { ru: "обмен геолокацией: никольский ↔ бондарев" },
    description: {
      ru: "два телефона обмениваются живой локацией, пузырь чата с общей геопозицией, два сходящихся маркера.",
    },
    prompt: {
      ru: "обмен живой геолокацией в телефонном мессенджере между двумя контактами (никольский и бондарев), маленький пузырь живой карты с двумя сходящимися маркерами, показание eta, обобщённый чат-ui, 9:16, реквизитная вставка криминального сериала",
    },
    shortPrompt: {
      ru: "обмен живой локацией, два сходящихся маркера, eta, 9:16",
    },
    negativePrompt: {
      ru: "реальный брендинг мессенджера, весёлые цвета",
    },
    technicalNotes: {
      ru: ["пузырь чата с живой локацией", "два сходящихся маркера", "показание eta в моно"],
    },
  },
]

export const getInsert = (id: string): Insert | undefined =>
  INSERTS.find((i) => i.id === id)
