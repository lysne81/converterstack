/**
 * Fixed-offset time zone model (no DST).
 *
 * Each side of the converter is a **base** abbreviation with a fixed UTC
 * offset (UTC, GMT, EST, CET, …) plus a whole-hour **incrementor** layered on
 * top. The effective offset is `base.offset + increment * 60` minutes, and
 * conversion is pure arithmetic on the minute-of-day:
 *
 *   outMinutes = inMinutes + (toOffset − fromOffset)
 *
 * wrapping across midnight with a +/−N day marker. A representative city is
 * shown for the effective offset. This intentionally ignores DST — it is a
 * simple, predictable "offset calculator".
 */

/** A selectable base abbreviation with a fixed UTC offset (in minutes). */
export type Base = {
  /**
   * Stable key, also used in URLs. Unambiguous abbreviations use the
   * abbreviation itself ("CET"); abbreviations that mean different things in
   * different parts of the world get one key per meaning ("AST-atlantic",
   * "AST-arabia") so each meaning keeps its own offset.
   */
  key: string;
  /** Fixed UTC offset in minutes. */
  offset: number;
  /** Abbreviation shown in the picker; shared by every variant of a key. */
  abbrev: string;
  /** Full name of this meaning, e.g. "Atlantic Standard Time". */
  name: string;
};

/**
 * Curated set of well-known base abbreviations, ordered west-to-east by
 * offset. Duplicate offsets (UTC/GMT) are intentional — both are common, and
 * so are variants of an ambiguous abbreviation that happen to share an offset
 * with another zone (CST China / SGT, EST Australian / AEST).
 */
export const BASES: Base[] = [
  { key: "HST", offset: -600, abbrev: "HST", name: "Hawaii Standard Time" },
  { key: "AKST", offset: -540, abbrev: "AKST", name: "Alaska Standard Time" },
  { key: "PST", offset: -480, abbrev: "PST", name: "Pacific Standard Time" },
  { key: "MST", offset: -420, abbrev: "MST", name: "Mountain Standard Time" },
  {
    key: "CST-central",
    offset: -360,
    abbrev: "CST",
    name: "Central Standard Time",
  },
  {
    key: "EST-eastern",
    offset: -300,
    abbrev: "EST",
    name: "Eastern Standard Time",
  },
  { key: "CST-cuba", offset: -300, abbrev: "CST", name: "Cuba Standard Time" },
  {
    key: "AST-atlantic",
    offset: -240,
    abbrev: "AST",
    name: "Atlantic Standard Time",
  },
  { key: "BRT", offset: -180, abbrev: "BRT", name: "Brasília Time" },
  {
    key: "GST-southgeorgia",
    offset: -120,
    abbrev: "GST",
    name: "South Georgia Time",
  },
  { key: "UTC", offset: 0, abbrev: "UTC", name: "Coordinated Universal Time" },
  { key: "GMT", offset: 0, abbrev: "GMT", name: "Greenwich Mean Time" },
  { key: "CET", offset: 60, abbrev: "CET", name: "Central European Time" },
  { key: "IST-irish", offset: 60, abbrev: "IST", name: "Irish Standard Time" },
  { key: "EET", offset: 120, abbrev: "EET", name: "Eastern European Time" },
  {
    key: "IST-israel",
    offset: 120,
    abbrev: "IST",
    name: "Israel Standard Time",
  },
  { key: "MSK", offset: 180, abbrev: "MSK", name: "Moscow Standard Time" },
  {
    key: "AST-arabia",
    offset: 180,
    abbrev: "AST",
    name: "Arabia Standard Time",
  },
  { key: "GST-gulf", offset: 240, abbrev: "GST", name: "Gulf Standard Time" },
  {
    key: "IST-india",
    offset: 330,
    abbrev: "IST",
    name: "India Standard Time",
  },
  { key: "ICT", offset: 420, abbrev: "ICT", name: "Indochina Time" },
  { key: "SGT", offset: 480, abbrev: "SGT", name: "Singapore Time" },
  {
    key: "CST-china",
    offset: 480,
    abbrev: "CST",
    name: "China Standard Time",
  },
  { key: "JST", offset: 540, abbrev: "JST", name: "Japan Standard Time" },
  {
    key: "AEST",
    offset: 600,
    abbrev: "AEST",
    name: "Australian Eastern Standard Time",
  },
  {
    key: "EST-australian",
    offset: 600,
    abbrev: "EST",
    name: "Australian Eastern Standard Time",
  },
  {
    key: "NZST",
    offset: 720,
    abbrev: "NZST",
    name: "New Zealand Standard Time",
  },
];

const BASE_BY_KEY = new Map(BASES.map((b) => [b.key, b]));

/**
 * Bare abbreviations that are shared by several meanings resolve to their most
 * widely used one, so older links like `?from=EST` keep working.
 */
const BASE_ALIASES: Record<string, string> = {
  AST: "AST-atlantic",
  CST: "CST-central",
  EST: "EST-eastern",
  GST: "GST-gulf",
  IST: "IST-india",
};

/** Canonical zone key for `key`, resolving bare ambiguous abbreviations. */
export function resolveZoneKey(key: string): string {
  return BASE_ALIASES[key] ?? key;
}

/** Every variant of the abbreviation used by `key`, in west-to-east order. */
export function variantsForKey(key: string): Base[] {
  const base = getBase(key);
  if (!base) return [];
  return BASES.filter((b) => b.abbrev === base.abbrev);
}

export function getBase(key: string): Base | undefined {
  return BASE_BY_KEY.get(resolveZoneKey(key));
}

/** Is `key` a known base abbreviation? */
export function isBase(key: string | null | undefined): key is string {
  return !!key && BASE_BY_KEY.has(resolveZoneKey(key));
}

/** First base whose fixed offset equals `minutes`, if any. */
export function baseForOffset(minutes: number): string | undefined {
  return BASES.find((b) => b.offset === minutes)?.key;
}

/** Bounds on the effective offset (UTC−12 … UTC+14), in minutes. */
export const MIN_OFFSET = -12 * 60;
export const MAX_OFFSET = 14 * 60;

/** Representative city for an effective offset (minutes). */
const OFFSET_CITIES: Record<number, string> = {
  [-720]: "Baker Island",
  [-660]: "Pago Pago",
  [-600]: "Honolulu",
  [-570]: "Marquesas",
  [-540]: "Anchorage",
  [-480]: "Los Angeles",
  [-420]: "Denver",
  [-360]: "Chicago",
  [-300]: "New York",
  [-240]: "Halifax",
  [-210]: "St. John's",
  [-180]: "São Paulo",
  [-120]: "Fernando de Noronha",
  [-60]: "Azores",
  [0]: "London",
  [60]: "Paris",
  [120]: "Cairo",
  [180]: "Moscow",
  [210]: "Tehran",
  [240]: "Dubai",
  [270]: "Kabul",
  [300]: "Karachi",
  [330]: "Mumbai",
  [345]: "Kathmandu",
  [360]: "Dhaka",
  [390]: "Yangon",
  [420]: "Bangkok",
  [480]: "Singapore",
  [540]: "Tokyo",
  [570]: "Adelaide",
  [600]: "Sydney",
  [660]: "Nouméa",
  [720]: "Auckland",
  [780]: "Nukuʻalofa",
  [840]: "Kiritimati",
};

/** Representative city for an effective offset, or undefined if none is known. */
export function cityForOffset(minutes: number): string | undefined {
  return OFFSET_CITIES[minutes];
}

/**
 * A selectable zone option in the picker: either a base abbreviation
 * (label === key, e.g. "UTC") or a city (label is the city name). Both carry a
 * fixed standard UTC offset in minutes (DST is intentionally ignored).
 */
export type ZoneOption = {
  /** Stable key, also used in `?from=`/`?to=` URLs. */
  key: string;
  /** Text shown in the trigger + as the option's primary line. */
  label: string;
  /** Standard (non-DST) UTC offset in minutes — fallback + ordering. */
  offset: number;
  /** Secondary hint (country for cities, representative city for abbrevs). */
  sub?: string;
  /** IANA identifier for cities; enables DST-aware current offsets. */
  tz?: string;
};

/** Major cities with their standard UTC offset + IANA zone (DST-aware). */
const CITY_ZONES: ZoneOption[] = [
  { key: "pagopago", label: "Pago Pago", offset: -660, sub: "American Samoa" },
  { key: "honolulu", label: "Honolulu", offset: -600, sub: "United States" },
  { key: "anchorage", label: "Anchorage", offset: -540, sub: "United States" },
  { key: "losangeles", label: "Los Angeles", offset: -480, sub: "United States" },
  { key: "vancouver", label: "Vancouver", offset: -480, sub: "Canada" },
  { key: "sanfrancisco", label: "San Francisco", offset: -480, sub: "United States" },
  { key: "seattle", label: "Seattle", offset: -480, sub: "United States" },
  { key: "tijuana", label: "Tijuana", offset: -480, sub: "Mexico" },
  { key: "denver", label: "Denver", offset: -420, sub: "United States" },
  { key: "phoenix", label: "Phoenix", offset: -420, sub: "United States" },
  { key: "calgary", label: "Calgary", offset: -420, sub: "Canada" },
  { key: "chicago", label: "Chicago", offset: -360, sub: "United States" },
  { key: "mexicocity", label: "Mexico City", offset: -360, sub: "Mexico" },
  { key: "winnipeg", label: "Winnipeg", offset: -360, sub: "Canada" },
  { key: "guatemalacity", label: "Guatemala City", offset: -360, sub: "Guatemala" },
  { key: "newyork", label: "New York", offset: -300, sub: "United States" },
  { key: "toronto", label: "Toronto", offset: -300, sub: "Canada" },
  { key: "miami", label: "Miami", offset: -300, sub: "United States" },
  { key: "bogota", label: "Bogotá", offset: -300, sub: "Colombia" },
  { key: "lima", label: "Lima", offset: -300, sub: "Peru" },
  { key: "halifax", label: "Halifax", offset: -240, sub: "Canada" },
  { key: "santiago", label: "Santiago", offset: -240, sub: "Chile" },
  { key: "caracas", label: "Caracas", offset: -240, sub: "Venezuela" },
  { key: "lapaz", label: "La Paz", offset: -240, sub: "Bolivia" },
  { key: "stjohns", label: "St. John's", offset: -210, sub: "Canada" },
  { key: "saopaulo", label: "São Paulo", offset: -180, sub: "Brazil" },
  { key: "buenosaires", label: "Buenos Aires", offset: -180, sub: "Argentina" },
  { key: "riodejaneiro", label: "Rio de Janeiro", offset: -180, sub: "Brazil" },
  { key: "montevideo", label: "Montevideo", offset: -180, sub: "Uruguay" },
  { key: "azores", label: "Azores", offset: -60, sub: "Portugal" },
  { key: "london", label: "London", offset: 0, sub: "United Kingdom" },
  { key: "dublin", label: "Dublin", offset: 0, sub: "Ireland" },
  { key: "lisbon", label: "Lisbon", offset: 0, sub: "Portugal" },
  { key: "reykjavik", label: "Reykjavík", offset: 0, sub: "Iceland" },
  { key: "accra", label: "Accra", offset: 0, sub: "Ghana" },
  { key: "casablanca", label: "Casablanca", offset: 0, sub: "Morocco" },
  { key: "paris", label: "Paris", offset: 60, sub: "France" },
  { key: "berlin", label: "Berlin", offset: 60, sub: "Germany" },
  { key: "madrid", label: "Madrid", offset: 60, sub: "Spain" },
  { key: "rome", label: "Rome", offset: 60, sub: "Italy" },
  { key: "amsterdam", label: "Amsterdam", offset: 60, sub: "Netherlands" },
  { key: "brussels", label: "Brussels", offset: 60, sub: "Belgium" },
  { key: "vienna", label: "Vienna", offset: 60, sub: "Austria" },
  { key: "zurich", label: "Zürich", offset: 60, sub: "Switzerland" },
  { key: "oslo", label: "Oslo", offset: 60, sub: "Norway" },
  { key: "stockholm", label: "Stockholm", offset: 60, sub: "Sweden" },
  { key: "copenhagen", label: "Copenhagen", offset: 60, sub: "Denmark" },
  { key: "warsaw", label: "Warsaw", offset: 60, sub: "Poland" },
  { key: "prague", label: "Prague", offset: 60, sub: "Czechia" },
  { key: "budapest", label: "Budapest", offset: 60, sub: "Hungary" },
  { key: "lagos", label: "Lagos", offset: 60, sub: "Nigeria" },
  { key: "cairo", label: "Cairo", offset: 120, sub: "Egypt" },
  { key: "athens", label: "Athens", offset: 120, sub: "Greece" },
  { key: "helsinki", label: "Helsinki", offset: 120, sub: "Finland" },
  { key: "kyiv", label: "Kyiv", offset: 120, sub: "Ukraine" },
  { key: "bucharest", label: "Bucharest", offset: 120, sub: "Romania" },
  { key: "johannesburg", label: "Johannesburg", offset: 120, sub: "South Africa" },
  { key: "jerusalem", label: "Jerusalem", offset: 120, sub: "Israel" },
  { key: "capetown", label: "Cape Town", offset: 120, sub: "South Africa" },
  { key: "moscow", label: "Moscow", offset: 180, sub: "Russia" },
  { key: "istanbul", label: "Istanbul", offset: 180, sub: "Turkey" },
  { key: "riyadh", label: "Riyadh", offset: 180, sub: "Saudi Arabia" },
  { key: "nairobi", label: "Nairobi", offset: 180, sub: "Kenya" },
  { key: "baghdad", label: "Baghdad", offset: 180, sub: "Iraq" },
  { key: "doha", label: "Doha", offset: 180, sub: "Qatar" },
  { key: "tehran", label: "Tehran", offset: 210, sub: "Iran" },
  { key: "dubai", label: "Dubai", offset: 240, sub: "United Arab Emirates" },
  { key: "abudhabi", label: "Abu Dhabi", offset: 240, sub: "United Arab Emirates" },
  { key: "baku", label: "Baku", offset: 240, sub: "Azerbaijan" },
  { key: "tbilisi", label: "Tbilisi", offset: 240, sub: "Georgia" },
  { key: "yerevan", label: "Yerevan", offset: 240, sub: "Armenia" },
  { key: "kabul", label: "Kabul", offset: 270, sub: "Afghanistan" },
  { key: "karachi", label: "Karachi", offset: 300, sub: "Pakistan" },
  { key: "tashkent", label: "Tashkent", offset: 300, sub: "Uzbekistan" },
  { key: "mumbai", label: "Mumbai", offset: 330, sub: "India" },
  { key: "newdelhi", label: "New Delhi", offset: 330, sub: "India" },
  { key: "bengaluru", label: "Bengaluru", offset: 330, sub: "India" },
  { key: "kolkata", label: "Kolkata", offset: 330, sub: "India" },
  { key: "chennai", label: "Chennai", offset: 330, sub: "India" },
  { key: "colombo", label: "Colombo", offset: 330, sub: "Sri Lanka" },
  { key: "kathmandu", label: "Kathmandu", offset: 345, sub: "Nepal" },
  { key: "dhaka", label: "Dhaka", offset: 360, sub: "Bangladesh" },
  { key: "almaty", label: "Almaty", offset: 360, sub: "Kazakhstan" },
  { key: "yangon", label: "Yangon", offset: 390, sub: "Myanmar" },
  { key: "bangkok", label: "Bangkok", offset: 420, sub: "Thailand" },
  { key: "jakarta", label: "Jakarta", offset: 420, sub: "Indonesia" },
  { key: "hanoi", label: "Hanoi", offset: 420, sub: "Vietnam" },
  { key: "hochiminh", label: "Ho Chi Minh City", offset: 420, sub: "Vietnam" },
  { key: "singapore", label: "Singapore", offset: 480, sub: "Singapore" },
  { key: "shanghai", label: "Shanghai", offset: 480, sub: "China" },
  { key: "beijing", label: "Beijing", offset: 480, sub: "China" },
  { key: "hongkong", label: "Hong Kong", offset: 480, sub: "China" },
  { key: "taipei", label: "Taipei", offset: 480, sub: "Taiwan" },
  { key: "kualalumpur", label: "Kuala Lumpur", offset: 480, sub: "Malaysia" },
  { key: "manila", label: "Manila", offset: 480, sub: "Philippines" },
  { key: "perth", label: "Perth", offset: 480, sub: "Australia" },
  { key: "tokyo", label: "Tokyo", offset: 540, sub: "Japan" },
  { key: "seoul", label: "Seoul", offset: 540, sub: "South Korea" },
  { key: "osaka", label: "Osaka", offset: 540, sub: "Japan" },
  { key: "adelaide", label: "Adelaide", offset: 570, sub: "Australia" },
  { key: "darwin", label: "Darwin", offset: 570, sub: "Australia" },
  { key: "sydney", label: "Sydney", offset: 600, sub: "Australia" },
  { key: "melbourne", label: "Melbourne", offset: 600, sub: "Australia" },
  { key: "brisbane", label: "Brisbane", offset: 600, sub: "Australia" },
  { key: "guam", label: "Guam", offset: 600, sub: "Guam" },
  { key: "noumea", label: "Nouméa", offset: 660, sub: "New Caledonia" },
  { key: "honiara", label: "Honiara", offset: 660, sub: "Solomon Islands" },
  { key: "auckland", label: "Auckland", offset: 720, sub: "New Zealand" },
  { key: "wellington", label: "Wellington", offset: 720, sub: "New Zealand" },
  { key: "suva", label: "Suva", offset: 720, sub: "Fiji" },
  { key: "nukualofa", label: "Nukuʻalofa", offset: 780, sub: "Tonga" },
  { key: "apia", label: "Apia", offset: 780, sub: "Samoa" },
];

/** IANA identifier per city key — drives DST-aware current offsets. */
const CITY_TZ: Record<string, string> = {
  pagopago: "Pacific/Pago_Pago",
  honolulu: "Pacific/Honolulu",
  anchorage: "America/Anchorage",
  losangeles: "America/Los_Angeles",
  vancouver: "America/Vancouver",
  sanfrancisco: "America/Los_Angeles",
  seattle: "America/Los_Angeles",
  tijuana: "America/Tijuana",
  denver: "America/Denver",
  phoenix: "America/Phoenix",
  calgary: "America/Edmonton",
  chicago: "America/Chicago",
  mexicocity: "America/Mexico_City",
  winnipeg: "America/Winnipeg",
  guatemalacity: "America/Guatemala",
  newyork: "America/New_York",
  toronto: "America/Toronto",
  miami: "America/New_York",
  bogota: "America/Bogota",
  lima: "America/Lima",
  halifax: "America/Halifax",
  santiago: "America/Santiago",
  caracas: "America/Caracas",
  lapaz: "America/La_Paz",
  stjohns: "America/St_Johns",
  saopaulo: "America/Sao_Paulo",
  buenosaires: "America/Argentina/Buenos_Aires",
  riodejaneiro: "America/Sao_Paulo",
  montevideo: "America/Montevideo",
  azores: "Atlantic/Azores",
  london: "Europe/London",
  dublin: "Europe/Dublin",
  lisbon: "Europe/Lisbon",
  reykjavik: "Atlantic/Reykjavik",
  accra: "Africa/Accra",
  casablanca: "Africa/Casablanca",
  paris: "Europe/Paris",
  berlin: "Europe/Berlin",
  madrid: "Europe/Madrid",
  rome: "Europe/Rome",
  amsterdam: "Europe/Amsterdam",
  brussels: "Europe/Brussels",
  vienna: "Europe/Vienna",
  zurich: "Europe/Zurich",
  oslo: "Europe/Oslo",
  stockholm: "Europe/Stockholm",
  copenhagen: "Europe/Copenhagen",
  warsaw: "Europe/Warsaw",
  prague: "Europe/Prague",
  budapest: "Europe/Budapest",
  lagos: "Africa/Lagos",
  cairo: "Africa/Cairo",
  athens: "Europe/Athens",
  helsinki: "Europe/Helsinki",
  kyiv: "Europe/Kyiv",
  bucharest: "Europe/Bucharest",
  johannesburg: "Africa/Johannesburg",
  jerusalem: "Asia/Jerusalem",
  capetown: "Africa/Johannesburg",
  moscow: "Europe/Moscow",
  istanbul: "Europe/Istanbul",
  riyadh: "Asia/Riyadh",
  nairobi: "Africa/Nairobi",
  baghdad: "Asia/Baghdad",
  doha: "Asia/Qatar",
  tehran: "Asia/Tehran",
  dubai: "Asia/Dubai",
  abudhabi: "Asia/Dubai",
  baku: "Asia/Baku",
  tbilisi: "Asia/Tbilisi",
  yerevan: "Asia/Yerevan",
  kabul: "Asia/Kabul",
  karachi: "Asia/Karachi",
  tashkent: "Asia/Tashkent",
  mumbai: "Asia/Kolkata",
  newdelhi: "Asia/Kolkata",
  bengaluru: "Asia/Kolkata",
  kolkata: "Asia/Kolkata",
  chennai: "Asia/Kolkata",
  colombo: "Asia/Colombo",
  kathmandu: "Asia/Kathmandu",
  dhaka: "Asia/Dhaka",
  almaty: "Asia/Almaty",
  yangon: "Asia/Yangon",
  bangkok: "Asia/Bangkok",
  jakarta: "Asia/Jakarta",
  hanoi: "Asia/Bangkok",
  hochiminh: "Asia/Ho_Chi_Minh",
  singapore: "Asia/Singapore",
  shanghai: "Asia/Shanghai",
  beijing: "Asia/Shanghai",
  hongkong: "Asia/Hong_Kong",
  taipei: "Asia/Taipei",
  kualalumpur: "Asia/Kuala_Lumpur",
  manila: "Asia/Manila",
  perth: "Australia/Perth",
  tokyo: "Asia/Tokyo",
  seoul: "Asia/Seoul",
  osaka: "Asia/Tokyo",
  adelaide: "Australia/Adelaide",
  darwin: "Australia/Darwin",
  sydney: "Australia/Sydney",
  melbourne: "Australia/Melbourne",
  brisbane: "Australia/Brisbane",
  guam: "Pacific/Guam",
  noumea: "Pacific/Noumea",
  honiara: "Pacific/Guadalcanal",
  auckland: "Pacific/Auckland",
  wellington: "Pacific/Auckland",
  suva: "Pacific/Fiji",
  nukualofa: "Pacific/Tongatapu",
  apia: "Pacific/Apia",
};

/**
 * All selectable zone options: base abbreviations first (quick picks), then
 * cities. Searchable by key, label, or sub in the picker.
 */
export const ZONE_OPTIONS: ZoneOption[] = [
  ...BASES.map((b) => ({
    key: b.key,
    label: b.abbrev,
    offset: b.offset,
    sub: b.name,
  })),
  ...CITY_ZONES.map((c) => ({ ...c, tz: CITY_TZ[c.key] })),
];

const OPTION_BY_KEY = new Map(ZONE_OPTIONS.map((o) => [o.key, o]));

export function getOption(key: string): ZoneOption | undefined {
  return OPTION_BY_KEY.get(resolveZoneKey(key));
}

/** Is `key` a known zone option (abbreviation or city)? */
export function isOption(key: string | null | undefined): key is string {
  return !!key && OPTION_BY_KEY.has(resolveZoneKey(key));
}

/** Standard (non-DST) offset (minutes) for a zone-option key. */
export function offsetForKey(key: string): number {
  return OPTION_BY_KEY.get(resolveZoneKey(key))?.offset ?? 0;
}

/**
 * UTC offset (minutes) of an IANA zone at `date`, via Intl (DST-aware).
 * Positive east of UTC.
 */
export function tzOffsetMinutes(tz: string, date: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const map: Record<string, number> = {};
  for (const p of dtf.formatToParts(date)) {
    if (p.type !== "literal" && p.type !== "timeZoneName") {
      map[p.type] = Number(p.value);
    }
  }
  const asUTC = Date.UTC(
    map.year,
    map.month - 1,
    map.day,
    map.hour,
    map.minute,
    map.second,
  );
  return Math.round((asUTC - date.getTime()) / 60000);
}

/**
 * Current UTC offset (minutes) for a zone-option key. For cities with an IANA
 * zone this is DST-aware ("now"); abbreviations use their fixed offset.
 */
export function currentOffsetForKey(key: string, now: Date = new Date()): number {
  const opt = OPTION_BY_KEY.get(resolveZoneKey(key));
  if (!opt) return 0;
  return opt.tz ? tzOffsetMinutes(opt.tz, now) : opt.offset;
}

/**
 * Whether a zone-option key is currently observing DST. True when its live
 * offset differs from its standard offset (min of January/July). Abbreviations
 * and DST-free zones return false.
 */
export function isDstActive(key: string, now: Date = new Date()): boolean {
  const opt = OPTION_BY_KEY.get(resolveZoneKey(key));
  if (!opt?.tz) return false;
  const year = now.getUTCFullYear();
  const jan = tzOffsetMinutes(opt.tz, new Date(Date.UTC(year, 0, 1)));
  const jul = tzOffsetMinutes(opt.tz, new Date(Date.UTC(year, 6, 1)));
  if (jan === jul) return false;
  return tzOffsetMinutes(opt.tz, now) !== Math.min(jan, jul);
}

/** Format an offset (minutes) as a short signed label, e.g. "+9", "−4", "+5:30", "+0". */
export function formatOffset(minutes: number): string {
  const sign = minutes >= 0 ? "+" : "−";
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${sign}${h}${m ? ":" + String(m).padStart(2, "0") : ""}`;
}

/** Format a whole-hour increment as a signed label, e.g. "+0", "+1", "−2". */
export function formatIncrement(hours: number): string {
  return `${hours >= 0 ? "+" : "−"}${Math.abs(hours)}`;
}

/**
 * Effective offset (minutes) for a zone option + whole-hour increment, clamped.
 * Uses the DST-aware current offset for cities.
 */
export function effectiveOffset(
  key: string,
  increment: number,
  now: Date = new Date(),
): number {
  const raw = currentOffsetForKey(key, now) + increment * 60;
  return Math.min(MAX_OFFSET, Math.max(MIN_OFFSET, raw));
}

/**
 * Parse a zone query param into a base key + increment. Accepts a bare key
 * ("EST", "AST-arabia", "tokyo") or an inline signed increment ("EST+2",
 * "cet-1"). Bare ambiguous abbreviations resolve to their primary meaning.
 * Returns null when the key is unknown so callers can fall back to a default.
 */
export function parseZoneParam(
  raw: string | null,
): { key: string; increment: number } | null {
  if (!raw) return null;
  const m = /^([A-Za-z]+(?:-[A-Za-z]+)*)\s*([+-]?\d+)?$/.exec(raw.trim());
  if (!m) return null;
  if (!isOption(m[1])) return null;
  const inc = m[2] ? Number(m[2]) : 0;
  return {
    key: resolveZoneKey(m[1]),
    increment: Number.isFinite(inc) ? inc : 0,
  };
}

/** "HH:MM" -> minutes since midnight, or null if malformed. */
export function timeToMinutes(timeStr: string): number | null {
  const m = /^(\d{2}):(\d{2})$/.exec(timeStr);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/** Minutes since midnight (any integer) -> "HH:MM", wrapping into [00:00, 24:00). */
export function minutesToTime(minutes: number): string {
  const wrapped = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Current wall-clock time ("HH:MM") at a fixed UTC offset (minutes). */
export function nowTimeAtOffset(offsetMinutes: number): string {
  const utcMinutes = Math.floor(Date.now() / 60000);
  return minutesToTime(utcMinutes + offsetMinutes);
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/**
 * Short weekday name ("Mon", "Tue", …) at a fixed UTC offset, shifted by
 * `dayShift` whole days. Used to date the destination time relative to the
 * source zone's current day. Jan 1 1970 (UTC day 0) was a Thursday (index 4).
 */
export function weekdayAtOffset(offsetMinutes: number, dayShift = 0): string {
  const utcMinutes = Math.floor(Date.now() / 60000);
  const dayNumber = Math.floor((utcMinutes + offsetMinutes) / 1440) + dayShift;
  return WEEKDAYS[(((dayNumber + 4) % 7) + 7) % 7];
}

/**
 * Convert a source wall time to the target, using fixed offsets only.
 * Returns the target "HH:MM" and the whole-day difference (−1, 0, +1, …).
 */
export function convertTime(
  timeStr: string,
  fromOffset: number,
  toOffset: number,
): { time: string; dayDiff: number } | null {
  const t = timeToMinutes(timeStr);
  if (t === null) return null;
  const total = t + (toOffset - fromOffset);
  return { time: minutesToTime(total), dayDiff: Math.floor(total / 1440) };
}

/**
 * Step a "HH:MM" time string by `delta` hours, wrapping around midnight.
 * Minutes are preserved. Returns "HH:MM".
 */
export function shiftHour(timeStr: string, delta: number): string {
  const m = /^(\d{2}):(\d{2})$/.exec(timeStr);
  if (!m) return timeStr;
  const hour = (((Number(m[1]) + delta) % 24) + 24) % 24;
  return `${String(hour).padStart(2, "0")}:${m[2]}`;
}

/**
 * Render an "HH:MM" (24h) time in the chosen clock format. "24h" returns the
 * value as-is; "12h" appends AM/PM. Falls back to the raw string when malformed.
 */
export function formatTime(timeStr: string, mode: "24h" | "12h"): string {
  const mins = timeToMinutes(timeStr);
  if (mins === null) return timeStr;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (mode === "24h") {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }
  const period = h < 12 ? "AM" : "PM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

/** A city used for search discovery of the time-zone tool. */
export type SearchZone = {
  id: string;
  /** City name shown to the user. */
  label: string;
  /** Short abbreviation, for search matching. */
  abbrev: string;
  /** Base abbreviation this city prefills as (a key in `BASES`). */
  base: string;
};

/** Curated cities that map to a base, used only for search discovery. */
export const ZONES: SearchZone[] = [
  { id: "utc", label: "UTC", abbrev: "UTC", base: "UTC" },
  { id: "london", label: "London", abbrev: "GMT", base: "GMT" },
  { id: "paris", label: "Paris", abbrev: "CET", base: "CET" },
  { id: "newyork", label: "New York", abbrev: "EST", base: "EST-eastern" },
  { id: "chicago", label: "Chicago", abbrev: "CST", base: "CST-central" },
  { id: "losangeles", label: "Los Angeles", abbrev: "PST", base: "PST" },
  { id: "saopaulo", label: "São Paulo", abbrev: "BRT", base: "BRT" },
  { id: "dubai", label: "Dubai", abbrev: "GST", base: "GST-gulf" },
  { id: "mumbai", label: "Mumbai", abbrev: "IST", base: "IST-india" },
  { id: "shanghai", label: "Shanghai", abbrev: "CST", base: "CST-china" },
  { id: "tokyo", label: "Tokyo", abbrev: "JST", base: "JST" },
  { id: "sydney", label: "Sydney", abbrev: "AEST", base: "AEST" },
];
