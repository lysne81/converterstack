import {
  BASES,
  resolveZoneKey,
  type Base,
} from "../../lib/timezone";

/** A cross-link to another zone in this registry. */
export type TimezoneLink = {
  key: string;
  abbrev: string;
  name: string;
  offset: number;
};

/** An abbreviation that is easy to mix up with this one. */
export type TimezoneConfusion = {
  abbrev: string;
  name: string;
  /** Set when the confusable abbreviation also has a page here. */
  key?: string;
};

export type TimezoneDefinition = {
  base: Base;
  /** Route slug; identical to the canonical base key. */
  slug: string;
  abbrev: string;
  name: string;
  description: string;
  /** What the zone is used for and who keeps time by it. */
  usage: string;
  /** Countries and territories on this standard offset. */
  regions: string[];
  /** Representative cities that keep this standard offset. */
  cities: string[];
  /** IANA identifiers that sit on this standard offset. */
  ianaZones: string[];
  /** NATO/military phonetic letter, for whole-hour offsets only. */
  militaryLetter?: string;
  history?: string;
  /** Only set on UTC: why the converter measures everything against it. */
  whyReference?: string;
  notes: string[];
  confusions: TimezoneConfusion[];
  /** Other meanings of the same abbreviation. */
  otherMeanings: TimezoneLink[];
  /** Other zones in the converter that share this offset. */
  sameOffset: TimezoneLink[];
  example: string;
};

/** Format an offset in minutes as `UTC+05:30` / `UTC−04:00` / `UTC±00:00`. */
export function formatOffset(minutes: number): string {
  if (minutes === 0) return "UTC±00:00";
  const sign = minutes < 0 ? "−" : "+";
  const absoluteMinutes = Math.abs(minutes);
  const hours = Math.floor(absoluteMinutes / 60);
  const remainder = absoluteMinutes % 60;
  return `UTC${sign}${hours.toString().padStart(2, "0")}:${remainder
    .toString()
    .padStart(2, "0")}`;
}

/** NATO phonetic letter for a whole-hour offset, if one exists. */
const MILITARY_LETTERS: Record<number, string> = {
  [-720]: "Yankee (Y)",
  [-660]: "X-ray (X)",
  [-600]: "Whiskey (W)",
  [-540]: "Victor (V)",
  [-480]: "Uniform (U)",
  [-420]: "Tango (T)",
  [-360]: "Sierra (S)",
  [-300]: "Romeo (R)",
  [-240]: "Quebec (Q)",
  [-180]: "Papa (P)",
  [-120]: "Oscar (O)",
  [-60]: "November (N)",
  [0]: "Zulu (Z)",
  [60]: "Alpha (A)",
  [120]: "Bravo (B)",
  [180]: "Charlie (C)",
  [240]: "Delta (D)",
  [300]: "Echo (E)",
  [360]: "Foxtrot (F)",
  [420]: "Golf (G)",
  [480]: "Hotel (H)",
  [540]: "India (I)",
  [600]: "Kilo (K)",
  [660]: "Lima (L)",
  [720]: "Mike (M)",
};

type Content = Omit<
  TimezoneDefinition,
  | "base"
  | "slug"
  | "abbrev"
  | "name"
  | "militaryLetter"
  | "otherMeanings"
  | "sameOffset"
  | "example"
>;

/**
 * Authored content, keyed by canonical zone key. Everything that can be
 * derived — offset, abbreviation, meaning name, military letter, sibling
 * meanings, zones sharing an offset, and the worked example — is generated
 * from `BASES` so the pages can never drift from the converter.
 */
const CONTENT: Record<string, Content> = {
  HST: {
    description:
      "Hawaii Standard Time (HST) is the civil time of Hawaii, ten hours behind UTC.",
    usage:
      "HST is the year-round civil time of the state of Hawaii, and the same offset is used by French Polynesia's main islands.",
    regions: ["Hawaii (United States)", "French Polynesia"],
    cities: ["Honolulu", "Hilo", "Kailua-Kona", "Papeete"],
    ianaZones: ["Pacific/Honolulu", "Pacific/Tahiti"],
    history:
      "Hawaii settled on a whole-hour offset from UTC in 1947, replacing an earlier offset of 10 hours and 30 minutes that dated from the Kingdom of Hawaii's own standard.",
    notes: [
      "Hawaii keeps the same offset all year, which makes HST unusually stable compared with other North American abbreviations.",
      "The wider label Hawaii-Aleutian Standard Time (HAST) covers both Hawaii and the western Aleutian Islands.",
    ],
    confusions: [
      { abbrev: "HAST", name: "Hawaii-Aleutian Standard Time" },
      { abbrev: "AKST", name: "Alaska Standard Time", key: "AKST" },
    ],
  },

  AKST: {
    description:
      "Alaska Standard Time (AKST) is the standard time of almost all of Alaska, nine hours behind UTC.",
    usage:
      "AKST covers the great majority of Alaska, from the southeast panhandle through Anchorage and Fairbanks out to most of the Aleutian chain.",
    regions: ["Alaska (United States)"],
    cities: ["Anchorage", "Juneau", "Fairbanks", "Nome"],
    ianaZones: ["America/Anchorage", "America/Juneau", "America/Nome"],
    history:
      "Alaska used four separate time zones until 1983, when nearly the whole state was consolidated onto a single offset to simplify commerce with the contiguous United States.",
    notes: [
      "A single offset spans an enormous east–west distance, so solar noon in Alaska can fall well away from clock noon.",
      "The far western Aleutians keep the Hawaii-Aleutian offset instead of AKST.",
    ],
    confusions: [
      { abbrev: "HST", name: "Hawaii Standard Time", key: "HST" },
      { abbrev: "PST", name: "Pacific Standard Time", key: "PST" },
    ],
  },

  PST: {
    description:
      "Pacific Standard Time (PST) is the standard time of the North American Pacific coast, eight hours behind UTC.",
    usage:
      "PST is the standard time of California, Washington, Oregon and Nevada, of British Columbia and Yukon in Canada, and of Baja California in Mexico.",
    regions: ["Western United States", "Western Canada", "Baja California"],
    cities: [
      "Los Angeles",
      "San Francisco",
      "Seattle",
      "Vancouver",
      "Tijuana",
    ],
    ianaZones: [
      "America/Los_Angeles",
      "America/Vancouver",
      "America/Tijuana",
    ],
    history:
      "Pacific time is one of the standard zones adopted by North American railways in 1883 and confirmed in United States law by the Standard Time Act of 1918.",
    notes: [
      "PST is heavily used in software and media schedules because so much of the technology and entertainment industry sits on this offset.",
    ],
    confusions: [
      { abbrev: "MST", name: "Mountain Standard Time", key: "MST" },
      { abbrev: "AKST", name: "Alaska Standard Time", key: "AKST" },
    ],
  },

  MST: {
    description:
      "Mountain Standard Time (MST) is the standard time of the North American mountain interior, seven hours behind UTC.",
    usage:
      "MST is the standard time of Colorado, Utah, Arizona, New Mexico, Montana and Wyoming, of Alberta in Canada, and of several north-western Mexican states.",
    regions: ["Mountain United States", "Alberta", "North-western Mexico"],
    cities: ["Denver", "Phoenix", "Salt Lake City", "Calgary", "Edmonton"],
    ianaZones: [
      "America/Denver",
      "America/Phoenix",
      "America/Edmonton",
    ],
    history:
      "Mountain time entered the North American standard-time system in 1883, dividing the interior west from the Pacific coast and the Great Plains.",
    notes: [
      "Most of Arizona keeps this offset all year, which is why Arizona and California sometimes agree and sometimes differ by an hour.",
    ],
    confusions: [
      { abbrev: "PST", name: "Pacific Standard Time", key: "PST" },
      { abbrev: "MSK", name: "Moscow Standard Time", key: "MSK" },
    ],
  },

  "CST-central": {
    description:
      "Central Standard Time (CST) is the standard time of the North American interior, six hours behind UTC.",
    usage:
      "This is the most common meaning of CST in North America: the standard time of the central United States, central Canada, most of Mexico and much of Central America.",
    regions: [
      "Central United States",
      "Central Canada",
      "Mexico",
      "Central America",
    ],
    cities: [
      "Chicago",
      "Dallas",
      "Houston",
      "Mexico City",
      "Winnipeg",
      "Guatemala City",
    ],
    ianaZones: [
      "America/Chicago",
      "America/Winnipeg",
      "America/Mexico_City",
      "America/Guatemala",
    ],
    history:
      "Central time is one of the original zones created for North American railway timetables in 1883, built around the meridian 90° west.",
    notes: [
      "CST is the busiest of the ambiguous abbreviations: it is also used for China and for Cuba, with completely different offsets.",
      "Spell out the meaning, or use an IANA identifier, whenever CST appears in a schedule shared across continents.",
    ],
    confusions: [
      { abbrev: "CET", name: "Central European Time", key: "CET" },
      { abbrev: "EST", name: "Eastern Standard Time", key: "EST-eastern" },
    ],
  },

  "EST-eastern": {
    description:
      "Eastern Standard Time (EST) is the standard time of the North American east coast, five hours behind UTC.",
    usage:
      "EST is the standard time of the eastern United States and eastern Canada, and the same offset is kept year-round by Panama, Jamaica and much of the western Caribbean.",
    regions: [
      "Eastern United States",
      "Eastern Canada",
      "Panama",
      "Western Caribbean",
    ],
    cities: ["New York", "Toronto", "Miami", "Montréal", "Panama City"],
    ianaZones: [
      "America/New_York",
      "America/Toronto",
      "America/Panama",
      "America/Jamaica",
    ],
    history:
      "Eastern time grew out of the railway standard zones of 1883 and is anchored on the meridian 75° west, near Philadelphia.",
    notes: [
      "EST is probably the most quoted time-zone abbreviation in business writing, which is exactly why the Australian meaning causes confusion.",
    ],
    confusions: [
      { abbrev: "EET", name: "Eastern European Time", key: "EET" },
      { abbrev: "CST", name: "Central Standard Time", key: "CST-central" },
    ],
  },

  "CST-cuba": {
    description:
      "Cuba Standard Time (CST) is the standard time of Cuba, five hours behind UTC.",
    usage:
      "Cuba keeps its own national standard time, which shares an offset with Eastern Standard Time but is legislated separately in Havana.",
    regions: ["Cuba"],
    cities: ["Havana", "Santiago de Cuba", "Camagüey", "Santa Clara"],
    ianaZones: ["America/Havana"],
    history:
      "Cuba adopted a national standard offset in the early twentieth century and has set its own clock policy independently ever since.",
    notes: [
      "Cuban schedules usually write CST, which reads identically to the North American Central meaning six hours behind UTC.",
      "Use the IANA identifier America/Havana when Cuban time matters in software.",
    ],
    confusions: [
      { abbrev: "CST", name: "Central Standard Time", key: "CST-central" },
      { abbrev: "EST", name: "Eastern Standard Time", key: "EST-eastern" },
    ],
  },

  "AST-atlantic": {
    description:
      "Atlantic Standard Time (AST) is the standard time of Atlantic Canada and the eastern Caribbean, four hours behind UTC.",
    usage:
      "AST is the standard time of Nova Scotia, New Brunswick, Prince Edward Island and much of the eastern Caribbean, including Puerto Rico and the Dominican Republic.",
    regions: ["Atlantic Canada", "Eastern Caribbean", "Puerto Rico"],
    cities: [
      "Halifax",
      "Moncton",
      "San Juan",
      "Santo Domingo",
      "Bridgetown",
    ],
    ianaZones: [
      "America/Halifax",
      "America/Puerto_Rico",
      "America/Santo_Domingo",
      "America/Barbados",
    ],
    history:
      "Atlantic time was defined as the North American zone east of Eastern time, covering the maritime provinces and the islands beyond them.",
    notes: [
      "Newfoundland sits half an hour further east again, on an offset of UTC−03:30, and is not covered by AST.",
    ],
    confusions: [
      { abbrev: "AEST", name: "Australian Eastern Standard Time", key: "AEST" },
      { abbrev: "EST", name: "Eastern Standard Time", key: "EST-eastern" },
    ],
  },

  BRT: {
    description:
      "Brasília Time (BRT) is the principal civil time of Brazil, three hours behind UTC.",
    usage:
      "BRT is the reference time for Brazil's most populous states, including the federal capital, and is the offset used for national broadcasting and business hours.",
    regions: ["South-eastern Brazil", "Southern Brazil", "North-east Brazil"],
    cities: [
      "São Paulo",
      "Rio de Janeiro",
      "Brasília",
      "Belo Horizonte",
      "Salvador",
    ],
    ianaZones: ["America/Sao_Paulo"],
    history:
      "Brazil divided itself into standard zones in 1913, with the Brasília meridian serving as the country's principal reference ever since.",
    notes: [
      "Brazil spans several offsets; western states and the Fernando de Noronha archipelago do not use BRT.",
    ],
    confusions: [
      { abbrev: "ART", name: "Argentina Time" },
      { abbrev: "BST", name: "British Summer Time" },
    ],
  },

  "GST-southgeorgia": {
    description:
      "South Georgia Time (GST) is the time of South Georgia and the South Sandwich Islands, two hours behind UTC.",
    usage:
      "This offset covers a remote British Overseas Territory in the South Atlantic whose population is limited to a research and administrative station.",
    regions: ["South Georgia and the South Sandwich Islands"],
    cities: ["Grytviken", "King Edward Point"],
    ianaZones: ["Atlantic/South_Georgia"],
    notes: [
      "This meaning of GST is rare in everyday use, but it is the reason the abbreviation cannot be assumed to mean the Gulf.",
      "The territory keeps the same offset all year.",
    ],
    confusions: [
      { abbrev: "GST", name: "Gulf Standard Time", key: "GST-gulf" },
      { abbrev: "GMT", name: "Greenwich Mean Time", key: "GMT" },
    ],
  },

  UTC: {
    description:
      "Coordinated Universal Time (UTC) is the international reference for civil time, and the offset every other zone is measured against.",
    usage:
      "UTC is used for aviation, shipping, computing, scientific data and international coordination, and it is the offset the rest of this converter is defined against.",
    regions: ["Worldwide reference"],
    cities: ["Accra", "Abidjan", "Reykjavík", "Dakar"],
    ianaZones: ["UTC", "Etc/UTC"],
    whyReference:
      "Every zone in this converter is stored as a fixed number of minutes ahead of or behind UTC, so a conversion is simply the difference between two offsets. Anchoring on UTC keeps the arithmetic exact and reversible: converting a time from one zone to another and back always returns the original value, and no zone needs to know anything about any other zone.",
    history:
      "UTC was introduced in the 1960s and given its present form in 1972, when the leap-second system tied it to International Atomic Time while keeping it close to the Earth's rotation.",
    notes: [
      "UTC is maintained by the International Bureau of Weights and Measures from a worldwide ensemble of atomic clocks.",
      "UTC itself never shifts; only the local zones defined against it differ.",
      "In aviation and the military, UTC is spoken as Zulu time and written with a trailing Z.",
    ],
    confusions: [
      { abbrev: "GMT", name: "Greenwich Mean Time", key: "GMT" },
      { abbrev: "TAI", name: "International Atomic Time" },
    ],
  },

  GMT: {
    description:
      "Greenwich Mean Time (GMT) is mean solar time at the Greenwich meridian, and in civil use it is the same clock reading as UTC.",
    usage:
      "GMT is the winter civil time of the United Kingdom and Ireland and is kept year-round by several West African countries; it is also still used as a general label for the zero offset.",
    regions: ["United Kingdom", "Ireland", "Iceland", "West Africa"],
    cities: ["London", "Dublin", "Reykjavík", "Accra", "Abidjan"],
    ianaZones: [
      "Europe/London",
      "Atlantic/Reykjavik",
      "Africa/Accra",
      "Africa/Abidjan",
    ],
    history:
      "Greenwich Mean Time grew out of the Royal Observatory's work on navigation and was adopted as the world's prime meridian at the International Meridian Conference in 1884, making it the basis of global timekeeping until UTC took over that role.",
    notes: [
      "For civil purposes GMT and UTC show the same time; they differ in how they are defined, not in what a clock reads.",
      "GMT is astronomical in origin, while UTC is generated from atomic clocks — which is why technical standards prefer UTC.",
    ],
    confusions: [
      { abbrev: "UTC", name: "Coordinated Universal Time", key: "UTC" },
      { abbrev: "WET", name: "Western European Time" },
    ],
  },

  CET: {
    description:
      "Central European Time (CET) is the standard time of most of continental western Europe, one hour ahead of UTC.",
    usage:
      "CET is the standard time of a broad block of countries from Spain and France through Germany and Poland up to Norway and Sweden, and it is kept year-round in parts of North Africa.",
    regions: ["Western Europe", "Central Europe", "North Africa"],
    cities: ["Paris", "Berlin", "Madrid", "Rome", "Oslo", "Warsaw"],
    ianaZones: [
      "Europe/Paris",
      "Europe/Berlin",
      "Europe/Oslo",
      "Europe/Madrid",
      "Africa/Algiers",
    ],
    history:
      "Central European Time spread from the German and Austro-Hungarian railway standards of the 1890s, and the bloc grew during the twentieth century as neighbouring states aligned their clocks for trade.",
    notes: [
      "Spain sits far west of the meridian this offset is built on, so Spanish clock time runs well ahead of local solar time.",
    ],
    confusions: [
      { abbrev: "CST", name: "Central Standard Time", key: "CST-central" },
      { abbrev: "EET", name: "Eastern European Time", key: "EET" },
    ],
  },

  "IST-irish": {
    description:
      "Irish Standard Time (IST) is the legal time of Ireland during the brighter half of the year, one hour ahead of UTC.",
    usage:
      "Irish law is unusual in defining this offset as the country's standard time rather than as an adjustment applied to it, which is why the abbreviation appears with a +1 offset.",
    regions: ["Ireland"],
    cities: ["Dublin", "Cork", "Galway", "Limerick"],
    ianaZones: ["Europe/Dublin"],
    history:
      "The Standard Time (Amendment) Act 1971 defined Irish Standard Time as one hour ahead of UTC, inverting the usual arrangement used by neighbouring countries.",
    notes: [
      "This is the reason a single abbreviation, IST, can mean an offset of +01:00 in Dublin, +02:00 in Israel and +05:30 in India.",
      "Use Europe/Dublin when Irish time matters in software.",
    ],
    confusions: [
      { abbrev: "GMT", name: "Greenwich Mean Time", key: "GMT" },
      { abbrev: "IST", name: "India Standard Time", key: "IST-india" },
    ],
  },

  EET: {
    description:
      "Eastern European Time (EET) is the standard time of south-eastern Europe and the eastern Mediterranean, two hours ahead of UTC.",
    usage:
      "EET is the standard time of Greece, Finland, Romania, Bulgaria, Ukraine and the Baltic states, and the same offset is used in Egypt and the Levant.",
    regions: ["South-eastern Europe", "Baltic states", "North-east Africa"],
    cities: ["Athens", "Helsinki", "Bucharest", "Kyiv", "Cairo"],
    ianaZones: [
      "Europe/Athens",
      "Europe/Helsinki",
      "Europe/Bucharest",
      "Europe/Kyiv",
      "Africa/Cairo",
    ],
    history:
      "Eastern European Time was adopted country by country in the early twentieth century as the eastern counterpart to the central European bloc.",
    notes: [
      "South Africa uses the same offset but calls it South Africa Standard Time (SAST), not EET.",
    ],
    confusions: [
      { abbrev: "CET", name: "Central European Time", key: "CET" },
      { abbrev: "EST", name: "Eastern Standard Time", key: "EST-eastern" },
    ],
  },

  "IST-israel": {
    description:
      "Israel Standard Time (IST) is the standard time of Israel, two hours ahead of UTC.",
    usage:
      "IST is Israel's legal civil time and is used for all domestic scheduling; it shares its offset with Eastern European Time.",
    regions: ["Israel"],
    cities: ["Jerusalem", "Tel Aviv", "Haifa", "Beersheba"],
    ianaZones: ["Asia/Jerusalem"],
    history:
      "Israel has set its own clock policy since 1948, and the timing of its seasonal changes has repeatedly been the subject of national legislation.",
    notes: [
      "Israeli sources sometimes write IST and sometimes IDT, while international sources may simply write UTC+2 to avoid the clash with India.",
    ],
    confusions: [
      { abbrev: "IST", name: "India Standard Time", key: "IST-india" },
      { abbrev: "EET", name: "Eastern European Time", key: "EET" },
    ],
  },

  MSK: {
    description:
      "Moscow Standard Time (MSK) is the civil time of Moscow and western Russia, three hours ahead of UTC.",
    usage:
      "MSK is the reference offset for Russian railways, broadcasting and federal administration, and it covers the most populous part of the country.",
    regions: ["Western Russia"],
    cities: [
      "Moscow",
      "Saint Petersburg",
      "Nizhny Novgorod",
      "Rostov-on-Don",
    ],
    ianaZones: ["Europe/Moscow", "Europe/Volgograd", "Europe/Kirov"],
    history:
      "Moscow Time has moved between UTC+03:00 and UTC+04:00 several times as Russian clock policy changed, and it was fixed at UTC+03:00 without seasonal changes in 2014.",
    notes: [
      "Russia spans eleven time zones, and other Russian offsets are commonly written relative to Moscow, such as MSK+4.",
    ],
    confusions: [
      { abbrev: "MST", name: "Mountain Standard Time", key: "MST" },
      { abbrev: "EAT", name: "East Africa Time" },
    ],
  },

  "AST-arabia": {
    description:
      "Arabia Standard Time (AST) is the standard time of the western Gulf and the Arabian Peninsula, three hours ahead of UTC.",
    usage:
      "AST is the civil time of Saudi Arabia, Kuwait, Bahrain, Qatar, Yemen and Iraq, and is used across the region's financial markets and airlines.",
    regions: ["Arabian Peninsula", "Iraq"],
    cities: ["Riyadh", "Kuwait City", "Doha", "Manama", "Baghdad"],
    ianaZones: [
      "Asia/Riyadh",
      "Asia/Kuwait",
      "Asia/Qatar",
      "Asia/Baghdad",
    ],
    history:
      "The Gulf states standardised on whole-hour offsets during the twentieth century as oil exports and aviation made shared schedules necessary.",
    notes: [
      "The countries on this offset keep it all year, so Arabia Standard Time has no seasonal counterpart.",
      "The United Arab Emirates and Oman sit one hour further east on Gulf Standard Time.",
    ],
    confusions: [
      { abbrev: "AST", name: "Atlantic Standard Time", key: "AST-atlantic" },
      { abbrev: "GST", name: "Gulf Standard Time", key: "GST-gulf" },
    ],
  },

  "GST-gulf": {
    description:
      "Gulf Standard Time (GST) is the standard time of the south-eastern Gulf, four hours ahead of UTC.",
    usage:
      "GST is the civil time of the United Arab Emirates and Oman, and is widely quoted in aviation and logistics because of the traffic through Dubai.",
    regions: ["United Arab Emirates", "Oman"],
    cities: ["Dubai", "Abu Dhabi", "Sharjah", "Muscat"],
    ianaZones: ["Asia/Dubai", "Asia/Muscat"],
    history:
      "The United Arab Emirates and Oman settled on this offset as regional aviation and trade grew, keeping them one hour ahead of the western Gulf states.",
    notes: [
      "This offset is kept all year, so a Gulf schedule stays fixed while European and North American partners shift around it.",
    ],
    confusions: [
      { abbrev: "GST", name: "South Georgia Time", key: "GST-southgeorgia" },
      { abbrev: "AST", name: "Arabia Standard Time", key: "AST-arabia" },
    ],
  },

  "IST-india": {
    description:
      "India Standard Time (IST) is the single national time of India, five and a half hours ahead of UTC.",
    usage:
      "IST is the civil time of the whole of India, from Gujarat to Arunachal Pradesh, and Sri Lanka keeps the same offset.",
    regions: ["India", "Sri Lanka"],
    cities: ["Mumbai", "Delhi", "Bengaluru", "Kolkata", "Colombo"],
    ianaZones: ["Asia/Kolkata", "Asia/Colombo"],
    history:
      "India Standard Time was established in 1906 on a meridian of 82°30′ east, near Mirzapur, and the half-hour offset that meridian produces has been kept ever since.",
    notes: [
      "The half-hour offset means IST is never a whole number of hours from most other zones, so conversions can land on :30.",
      "India uses one offset across a very wide country, so sunrise in the north-east comes long before the working day begins.",
    ],
    confusions: [
      { abbrev: "ICT", name: "Indochina Time", key: "ICT" },
      { abbrev: "IST", name: "Israel Standard Time", key: "IST-israel" },
    ],
  },

  ICT: {
    description:
      "Indochina Time (ICT) is the standard time of mainland South-East Asia, seven hours ahead of UTC.",
    usage:
      "ICT is the civil time of Thailand, Vietnam, Cambodia and Laos, and western Indonesia keeps the same offset under its own name.",
    regions: ["Thailand", "Vietnam", "Cambodia", "Laos"],
    cities: ["Bangkok", "Hanoi", "Ho Chi Minh City", "Phnom Penh", "Vientiane"],
    ianaZones: [
      "Asia/Bangkok",
      "Asia/Ho_Chi_Minh",
      "Asia/Phnom_Penh",
      "Asia/Vientiane",
    ],
    history:
      "The offset spread through the region during the French colonial period and was retained by the successor states after independence.",
    notes: [
      "The countries on this offset keep it year-round, which makes ICT a stable anchor for regional manufacturing schedules.",
    ],
    confusions: [
      { abbrev: "IST", name: "India Standard Time", key: "IST-india" },
      { abbrev: "WIB", name: "Western Indonesian Time" },
    ],
  },

  SGT: {
    description:
      "Singapore Time (SGT) is the civil time of Singapore, eight hours ahead of UTC.",
    usage:
      "SGT is the reference offset for one of Asia's largest financial and shipping hubs, and it is quoted constantly in regional market hours.",
    regions: ["Singapore"],
    cities: ["Singapore"],
    ianaZones: ["Asia/Singapore"],
    history:
      "Singapore moved to UTC+08:00 in 1982, giving up an earlier half-hour offset in order to share business hours with Malaysia and Hong Kong.",
    notes: [
      "Singapore sits geographically closer to UTC+07:00, so the chosen offset is a commercial decision rather than a solar one.",
    ],
    confusions: [
      { abbrev: "CST", name: "China Standard Time", key: "CST-china" },
      { abbrev: "HKT", name: "Hong Kong Time" },
    ],
  },

  "CST-china": {
    description:
      "China Standard Time (CST) is the single national time of mainland China, eight hours ahead of UTC.",
    usage:
      "CST is the civil time of the entire People's Republic of China, from the eastern seaboard to the far west, and it governs all domestic transport and broadcasting.",
    regions: ["Mainland China"],
    cities: ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chongqing"],
    ianaZones: ["Asia/Shanghai", "Asia/Macau"],
    history:
      "China used five zones before 1949 and afterwards unified the country on a single offset based on the meridian near Beijing.",
    notes: [
      "Because one offset covers roughly sixty degrees of longitude, clock time in western China departs sharply from solar time.",
      "Hong Kong and Macau share the offset but are usually written as HKT and MOT respectively.",
    ],
    confusions: [
      { abbrev: "CST", name: "Central Standard Time", key: "CST-central" },
      { abbrev: "SGT", name: "Singapore Time", key: "SGT" },
    ],
  },

  JST: {
    description:
      "Japan Standard Time (JST) is the single national time of Japan, nine hours ahead of UTC.",
    usage:
      "JST is the civil time of every Japanese prefecture and is used for all domestic transport, markets and broadcasting.",
    regions: ["Japan"],
    cities: ["Tokyo", "Osaka", "Nagoya", "Sapporo", "Fukuoka"],
    ianaZones: ["Asia/Tokyo"],
    history:
      "Japan adopted a national standard on the 135° east meridian, which runs through Akashi, in 1888, and has kept the same offset without seasonal changes since 1952.",
    notes: [
      "Korea keeps the same offset but calls it Korea Standard Time (KST).",
    ],
    confusions: [
      { abbrev: "KST", name: "Korea Standard Time" },
      { abbrev: "AEST", name: "Australian Eastern Standard Time", key: "AEST" },
    ],
  },

  AEST: {
    description:
      "Australian Eastern Standard Time (AEST) is the standard time of eastern Australia, ten hours ahead of UTC.",
    usage:
      "AEST is the standard time of New South Wales, Victoria, Queensland, Tasmania and the Australian Capital Territory, covering most of the country's population.",
    regions: ["Eastern Australia"],
    cities: ["Sydney", "Melbourne", "Brisbane", "Canberra", "Hobart"],
    ianaZones: [
      "Australia/Sydney",
      "Australia/Brisbane",
      "Australia/Melbourne",
    ],
    history:
      "The Australian colonies adopted standard zones in 1895, dividing the continent into eastern, central and western time.",
    notes: [
      "AEST is the unambiguous way to write eastern Australian time; the shorter form EST is the source of frequent mix-ups with North America.",
      "South Australia and the Northern Territory sit half an hour behind on UTC+09:30.",
    ],
    confusions: [
      { abbrev: "EST", name: "Eastern Standard Time", key: "EST-eastern" },
      { abbrev: "AWST", name: "Australian Western Standard Time" },
    ],
  },

  "EST-australian": {
    description:
      "Australian Eastern Standard Time is sometimes written simply as EST, ten hours ahead of UTC.",
    usage:
      "Older Australian schedules, legislation and databases frequently abbreviate eastern Australian time as EST rather than AEST, which is why the same three letters can mean UTC+10:00.",
    regions: ["Eastern Australia"],
    cities: ["Sydney", "Melbourne", "Brisbane", "Canberra"],
    ianaZones: ["Australia/Sydney", "Australia/Brisbane"],
    history:
      "Australia used EST for its eastern zone long before the clearer AEST form became common, and the older abbreviation survives in many documents.",
    notes: [
      "If an Australian source writes EST, it almost certainly means UTC+10:00, not the North American UTC−05:00.",
      "Prefer AEST, or an IANA identifier such as Australia/Sydney, to remove the ambiguity entirely.",
    ],
    confusions: [
      { abbrev: "EST", name: "Eastern Standard Time", key: "EST-eastern" },
      { abbrev: "AEST", name: "Australian Eastern Standard Time", key: "AEST" },
    ],
  },

  NZST: {
    description:
      "New Zealand Standard Time (NZST) is the standard time of New Zealand, twelve hours ahead of UTC.",
    usage:
      "NZST is the civil time of both the North and South Islands and is one of the first offsets in the world to begin a new day.",
    regions: ["New Zealand"],
    cities: ["Auckland", "Wellington", "Christchurch", "Dunedin"],
    ianaZones: ["Pacific/Auckland"],
    history:
      "New Zealand adopted a national standard in 1868, one of the earliest countries to do so, and moved to a whole twelve-hour offset in 1946.",
    notes: [
      "The Chatham Islands run 45 minutes ahead of NZST, one of the few quarter-hour offsets in use.",
    ],
    confusions: [
      { abbrev: "AEST", name: "Australian Eastern Standard Time", key: "AEST" },
      { abbrev: "FJT", name: "Fiji Time" },
    ],
  },
};

function toLink(base: Base): TimezoneLink {
  return {
    key: base.key,
    abbrev: base.abbrev,
    name: base.name,
    offset: base.offset,
  };
}

/** Worked example: what the converter shows for this zone at 12:00 UTC. */
function exampleFor(base: Base): string {
  if (base.key === "UTC") {
    return "12:00 UTC is the reading every other zone in this converter is measured from.";
  }
  const total = (((12 * 60 + base.offset) % 1440) + 1440) % 1440;
  const hours = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (total % 60).toString().padStart(2, "0");
  return `When it is 12:00 UTC, this converter shows ${hours}:${minutes} in ${base.name} (${base.abbrev}).`;
}

const DEFINITIONS: TimezoneDefinition[] = BASES.map((base) => {
  const content = CONTENT[base.key];
  if (!content) {
    throw new Error(`Missing time zone definition content for "${base.key}"`);
  }

  return {
    ...content,
    base,
    slug: base.key,
    abbrev: base.abbrev,
    name: base.name,
    militaryLetter: MILITARY_LETTERS[base.offset],
    otherMeanings: BASES.filter(
      (other) => other.abbrev === base.abbrev && other.key !== base.key,
    ).map(toLink),
    sameOffset: BASES.filter(
      (other) => other.offset === base.offset && other.key !== base.key,
    ).map(toLink),
    example: exampleFor(base),
  };
});

const DEFINITION_BY_KEY = new Map(
  DEFINITIONS.map((definition) => [definition.slug, definition]),
);

export function getTimezoneDefinitions(): readonly TimezoneDefinition[] {
  return DEFINITIONS;
}

/** Look up a definition by slug, accepting bare ambiguous abbreviations. */
export function getTimezoneDefinition(
  key: string,
): TimezoneDefinition | undefined {
  return DEFINITION_BY_KEY.get(resolveZoneKey(key));
}

/** Abbreviations that have more than one meaning, for index guidance. */
export function getAmbiguousAbbreviations(): string[] {
  const counts = new Map<string, number>();
  for (const base of BASES) {
    counts.set(base.abbrev, (counts.get(base.abbrev) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([abbrev]) => abbrev);
}
