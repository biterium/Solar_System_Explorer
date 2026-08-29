/**
 * Данные: NASA Planetary Fact Sheet (nssdc.gsfc.nasa.gov), JPL Solar System Dynamics —
 * открытые источники. Периоды, расстояния и диаметры — фактические значения;
 * в модели расстояния сжимаются степенной функцией (регулируемый масштаб),
 * иначе внутренние планеты слились бы с Солнцем.
 */

export type BodyType = "star" | "planet" | "comet";

export interface CelestialBody {
  id: string;
  name: string;
  latin: string;
  short: string;
  type: BodyType;
  color: string;      // базовый цвет диска
  glow: string;       // подсветка у освещённого края
  chip: string;       // цвет точки в легенде
  diameterKm: number;
  /** среднее расстояние от Солнца в а.е. (для планет); у комет — большая полуось */
  aAU: number;
  distanceLabel: string;
  periodDays: number;
  periodLabel: string;
  /** средняя долгота на эпоху J2000, градусы (направление движения) */
  startAngleDeg: number;
  /** ретроградное движение (комета Галлея) */
  retrograde?: boolean;
  facts: { label: string; value: string }[];
  description: string;
  /* --- только для комет --- */
  eccentricity?: number;
  /** дни от эпохи J2000 до прохождения перигелия */
  perihelionEpochDays?: number;
  /** ориентация орбиты на экране, градусы */
  argPeriDeg?: number;
  perihelionAU?: number;
  aphelionAU?: number;
}

export const SUN: CelestialBody = {
  id: "sun",
  name: "Солнце",
  latin: "Sol",
  short: "Солнце",
  type: "star",
  color: "#ffb14e",
  glow: "#fff3d6",
  chip: "#f6b04d",
  diameterKm: 1392700,
  aAU: 0,
  distanceLabel: "центр системы",
  periodDays: 0,
  periodLabel: "—",
  startAngleDeg: 0,
  facts: [
    { label: "Диаметр", value: "1 392 700 км" },
    { label: "Спектральный класс", value: "G2V, жёлтый карлик" },
    { label: "Возраст", value: "≈ 4,6 млрд лет" },
    { label: "Доля массы системы", value: "99,86 %" },
    { label: "Температура ядра", value: "≈ 15 000 000 °C" },
  ],
  description:
    "Звезда, вокруг которой обращается всё в Солнечной системе. Каждую секунду в ядре термоядерный синтез превращает около 600 млн тонн водорода в гелий; свет от Солнца доходит до Земли за 8 минут 20 секунд, а до Нептуна — за 4 часа.",
};

export const PLANETS: CelestialBody[] = [
  {
    id: "mercury",
    name: "Меркурий",
    latin: "Mercury",
    short: "Меркурий",
    type: "planet",
    color: "#b3a48d",
    glow: "#e6d7bd",
    chip: "#c0b096",
    diameterKm: 4879,
    aAU: 0.387,
    distanceLabel: "57,9 млн км · 0,39 а.е.",
    periodDays: 87.97,
    periodLabel: "88 земных суток",
    startAngleDeg: 252.25,
    facts: [
      { label: "Диаметр", value: "4 879 км" },
      { label: "Расстояние от Солнца", value: "57,9 млн км" },
      { label: "Орбитальный период", value: "88 суток" },
      { label: "Спутники", value: "нет" },
      { label: "Перепад температур", value: "−180 … +430 °C" },
    ],
    description:
      "Самая маленькая и самая близкая к Солнцу планета. Лишена плотной атмосферы, поэтому дневная сторона раскаляется до +430 °C, а ночная остывает до −180 °C — рекордный перепад среди планет. Один оборот вокруг оси длится почти два меркурианских года.",
  },
  {
    id: "venus",
    name: "Венера",
    latin: "Venus",
    short: "Венера",
    type: "planet",
    color: "#dcb277",
    glow: "#ffe6b8",
    chip: "#e8c48a",
    diameterKm: 12104,
    aAU: 0.723,
    distanceLabel: "108,2 млн км · 0,72 а.е.",
    periodDays: 224.7,
    periodLabel: "224,7 земных суток",
    startAngleDeg: 181.98,
    facts: [
      { label: "Диаметр", value: "12 104 км" },
      { label: "Расстояние от Солнца", value: "108,2 млн км" },
      { label: "Орбитальный период", value: "224,7 суток" },
      { label: "Температура поверхности", value: "+465 °C" },
      { label: "Давление у поверхности", value: "92 атм" },
    ],
    description:
      "Самая горячая планета: плотная углекислотная атмосфера создаёт мощнейший парниковый эффект. Вращается в обратную сторону — Солнце здесь восходит на западе, а венерианские сутки (243 земных) длиннее венерианского года.",
  },
  {
    id: "earth",
    name: "Земля",
    latin: "Earth",
    short: "Земля",
    type: "planet",
    color: "#3f87c9",
    glow: "#a9d8ff",
    chip: "#5aa3e0",
    diameterKm: 12756,
    aAU: 1.0,
    distanceLabel: "149,6 млн км · 1 а.е.",
    periodDays: 365.26,
    periodLabel: "365,25 суток",
    startAngleDeg: 100.46,
    facts: [
      { label: "Диаметр", value: "12 756 км" },
      { label: "Расстояние от Солнца", value: "149,6 млн км" },
      { label: "Орбитальный период", value: "365,25 суток" },
      { label: "Спутники", value: "1 — Луна" },
      { label: "Поверхность в воде", value: "71 %" },
    ],
    description:
      "Единственное известное место во Вселенной, где есть жизнь. Жидкая вода покрывает 71 % поверхности, а магнитное поле и озоновый слой защищают биосферу от солнечного ветра и ультрафиолета. В модели у Земли виден спутник — Луна.",
  },
  {
    id: "mars",
    name: "Марс",
    latin: "Mars",
    short: "Марс",
    type: "planet",
    color: "#c65f3a",
    glow: "#ffa070",
    chip: "#e07a50",
    diameterKm: 6792,
    aAU: 1.524,
    distanceLabel: "227,9 млн км · 1,52 а.е.",
    periodDays: 686.98,
    periodLabel: "687 земных суток",
    startAngleDeg: 355.45,
    facts: [
      { label: "Диаметр", value: "6 792 км" },
      { label: "Расстояние от Солнца", value: "227,9 млн км" },
      { label: "Орбитальный период", value: "687 суток" },
      { label: "Спутники", value: "2 — Фобос и Деймос" },
      { label: "Вулкан Олимп", value: "высота 21,9 км" },
    ],
    description:
      "«Красная планета» обязана цветом оксидам железа в грунте. Здесь находятся najwyżший вулкан Солнечной системы — Олимп (21,9 км) — и следы древних речных русел: Марс когда-то был тёплым и влажным. Сегодня его исследуют марсоходы.",
  },
  {
    id: "jupiter",
    name: "Юпитер",
    latin: "Jupiter",
    short: "Юпитер",
    type: "planet",
    color: "#c9965c",
    glow: "#f2cf9d",
    chip: "#d9a066",
    diameterKm: 142984,
    aAU: 5.203,
    distanceLabel: "778,6 млн км · 5,20 а.е.",
    periodDays: 4332.6,
    periodLabel: "11,86 года",
    startAngleDeg: 34.4,
    facts: [
      { label: "Диаметр", value: "142 984 км" },
      { label: "Расстояние от Солнца", value: "778,6 млн км" },
      { label: "Орбитальный период", value: "11,86 года" },
      { label: "Спутники", value: "95" },
      { label: "Большое красное пятно", value: "шторм старше 350 лет" },
    ],
    description:
      "Крупнейшая планета: в 2,5 раза массивнее всех остальных планет вместе взятых. Большое красное пятно — ураган размером с Землю, бушующий уже более трёх столетий. Сутки на Юпитере — самые короткие в системе: всего 9 часов 56 минут.",
  },
  {
    id: "saturn",
    name: "Сатурн",
    latin: "Saturn",
    short: "Сатурн",
    type: "planet",
    color: "#d4b476",
    glow: "#f7e4b4",
    chip: "#e3c584",
    diameterKm: 120536,
    aAU: 9.582,
    distanceLabel: "1 433,5 млн км · 9,58 а.е.",
    periodDays: 10759,
    periodLabel: "29,46 года",
    startAngleDeg: 49.94,
    facts: [
      { label: "Диаметр", value: "120 536 км" },
      { label: "Расстояние от Солнца", value: "1 433,5 млн км" },
      { label: "Орбитальный период", value: "29,46 года" },
      { label: "Спутники", value: "274 (данные 2025 г.)" },
      { label: "Плотность", value: "меньше плотности воды" },
    ],
    description:
      "Знаменит кольцами из льда и каменной пыли шириной до 280 000 км при толщине местами всего десятки метров. Единственная планета, чья средняя плотность ниже плотности воды. По числу спутников — 274 — Сатурн рекордсмен системы.",
  },
  {
    id: "uranus",
    name: "Уран",
    latin: "Uranus",
    short: "Уран",
    type: "planet",
    color: "#7fc4c9",
    glow: "#cdf0f1",
    chip: "#8fd5d8",
    diameterKm: 51118,
    aAU: 19.199,
    distanceLabel: "2 872,5 млн км · 19,20 а.е.",
    periodDays: 30688.5,
    periodLabel: "84,02 года",
    startAngleDeg: 313.23,
    facts: [
      { label: "Диаметр", value: "51 118 км" },
      { label: "Расстояние от Солнца", value: "2 872,5 млн км" },
      { label: "Орбитальный период", value: "84 года" },
      { label: "Спутники", value: "28" },
      { label: "Наклон оси вращения", value: "98° — «лежит на боку»" },
    ],
    description:
      "Ледяной гигант, открытый Уильямом Гершелем в 1781 году — первая планета, обнаруженная с помощью телескопа. Ось вращения наклонена на 98°, поэтому Уран катится по орбите «на боку», а полюса 42 года смотрят на Солнце. Метан придаёт ему бирюзовый оттенок.",
  },
  {
    id: "neptune",
    name: "Нептун",
    latin: "Neptune",
    short: "Нептун",
    type: "planet",
    color: "#4a76cf",
    glow: "#a3c2ff",
    chip: "#6f8fe0",
    diameterKm: 49528,
    aAU: 30.05,
    distanceLabel: "4 495,1 млн км · 30,05 а.е.",
    periodDays: 60182,
    periodLabel: "164,8 года",
    startAngleDeg: 304.88,
    facts: [
      { label: "Диаметр", value: "49 528 км" },
      { label: "Расстояние от Солнца", value: "4 495,1 млн км" },
      { label: "Орбитальный период", value: "164,8 года" },
      { label: "Спутники", value: "16" },
      { label: "Ветры", value: "до 2 100 км/ч" },
    ],
    description:
      "Самая дальняя планета системы, открытая в 1846 году «на кончике пера» — по математическим расчётам Леверье и Адамса, а не случайным наблюдением. Здесь дуют сильнейшие ветры: до 2 100 км/ч, быстрее скорости звука в земной атмосфере.",
  },
];

export const COMETS: CelestialBody[] = [
  {
    id: "halley",
    name: "1P/Галлея",
    latin: "1P/Halley",
    short: "Галлея",
    type: "comet",
    color: "#9fdcec",
    glow: "#e8fbff",
    chip: "#7fd6f2",
    diameterKm: 11,
    aAU: 17.83,
    distanceLabel: "перигелий 0,59 а.е. · афелий 35,1 а.е.",
    periodDays: 27778,
    periodLabel: "≈ 76 лет",
    startAngleDeg: 250,
    retrograde: true,
    eccentricity: 0.967,
    perihelionEpochDays: -5068,
    argPeriDeg: 125,
    perihelionAU: 0.586,
    aphelionAU: 35.1,
    facts: [
      { label: "Диаметр ядра", value: "15 × 8 км" },
      { label: "Орбитальный период", value: "≈ 76 лет" },
      { label: "Перигелий / афелий", value: "0,59 / 35,1 а.е." },
      { label: "Последний перигелий", value: "9 февраля 1986 г." },
      { label: "Следующий перигелий", value: "июль 2061 г." },
    ],
    description:
      "Самая знаменитая короткопериодическая комета: её возвращения записывались с 240 г. до н. э., а Эдмунд Галлей в 1705 году первым предсказал её возвращение. Движется ретроградно — навстречу планетам. У кометы два хвоста: голубой ионный (всегда от Солнца) и изогнутый пылевой.",
  },
  {
    id: "encke",
    name: "2P/Энке",
    latin: "2P/Encke",
    short: "Энке",
    type: "comet",
    color: "#b8e4f2",
    glow: "#f0fcff",
    chip: "#a5e0f5",
    diameterKm: 4.8,
    aAU: 2.22,
    distanceLabel: "перигелий 0,34 а.е. · афелий 4,10 а.е.",
    periodDays: 1212,
    periodLabel: "3,3 года",
    startAngleDeg: 160,
    eccentricity: 0.848,
    perihelionEpochDays: 7481,
    argPeriDeg: 205,
    perihelionAU: 0.339,
    aphelionAU: 4.1,
    facts: [
      { label: "Диаметр ядра", value: "4,8 км" },
      { label: "Орбитальный период", value: "3,3 года — рекорд" },
      { label: "Перигелий / афелий", value: "0,34 / 4,10 а.е." },
      { label: "Эксцентриситет", value: "0,848" },
      { label: "Связанные потоки", value: "Тауриды" },
    ],
    description:
      "Комета с самым коротким известным периодом — 3,3 года; первой из комет получила подтверждённый период (расчёт И. Энке, 1819). При каждом сближении с Солнцем теряет вещество и постепенно тускнеет; считается родительским телом метеорного потока Таурид.",
  },
  {
    id: "halebopp",
    name: "C/1995 O1 Хейла — Боппа",
    latin: "Hale–Bopp",
    short: "Хейла — Боппа",
    type: "comet",
    color: "#c4ecfa",
    glow: "#ffffff",
    chip: "#bfeafa",
    diameterKm: 60,
    aAU: 186,
    distanceLabel: "перигелий 0,91 а.е. · афелий ≈ 370 а.е.",
    periodDays: 920430,
    periodLabel: "≈ 2 520 лет",
    startAngleDeg: 320,
    eccentricity: 0.995,
    perihelionEpochDays: -1005,
    argPeriDeg: 350,
    perihelionAU: 0.914,
    aphelionAU: 370,
    facts: [
      { label: "Диаметр ядра", value: "≈ 60 км — гигант" },
      { label: "Орбитальный период", value: "≈ 2 520 лет" },
      { label: "Перигелий", value: "0,914 а.е. (1 апреля 1997)" },
      { label: "Видимость невооружённым глазом", value: "18 месяцев — рекорд" },
      { label: "Афелий", value: "≈ 370 а.е." },
    ],
    description:
      "«Великая комета 1997 года», открытая ещё на подлёте — за два года до перигелия. Одно из самых ярких ядер среди долгопериодических комет (≈ 60 км) сделало её видимой невооружённым глазом рекордные 18 месяцев. Вернётся лишь около 4500 года.",
  },
];

export const ALL_BODIES: CelestialBody[] = [SUN, ...PLANETS, ...COMETS];

export const BODY_MAP: Record<string, CelestialBody> = Object.fromEntries(
  ALL_BODIES.map((b) => [b.id, b]),
);

export const TYPE_LABEL: Record<BodyType, string> = {
  star: "Звезда",
  planet: "Планета",
  comet: "Комета",
};
