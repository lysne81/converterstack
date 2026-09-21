export type Category =
  | "length"
  | "mass"
  | "temperature"
  | "area"
  | "volume"
  | "cooking"
  | "speed"
  | "pressure"
  | "energy"
  | "power";

export type Unit = {
  id: string;
  label: string;
  symbol: string;
  category: Category;
};

export const UNITS: Unit[] = [
  // Length (base: meter)
  { id: "cm", label: "Centimeters", symbol: "cm", category: "length" },
  { id: "dm", label: "Decimeters", symbol: "dm", category: "length" },
  { id: "inches", label: "Inches", symbol: "in", category: "length" },
  { id: "m", label: "Meters", symbol: "m", category: "length" },
  { id: "feet", label: "Feet", symbol: "ft", category: "length" },
  { id: "km", label: "Kilometers", symbol: "km", category: "length" },
  { id: "miles", label: "Miles", symbol: "mi", category: "length" },
  { id: "nmi", label: "Nautical miles", symbol: "nmi", category: "length" },
  // Mass (base: kilogram)
  { id: "kg", label: "Kilograms", symbol: "kg", category: "mass" },
  { id: "lb", label: "Pounds", symbol: "lb", category: "mass" },
  { id: "g", label: "Grams", symbol: "g", category: "mass" },
  { id: "oz", label: "Ounces", symbol: "oz", category: "mass" },
  // Temperature (handled by formulas, not factors)
  { id: "celsius", label: "Celsius", symbol: "°C", category: "temperature" },
  { id: "fahrenheit", label: "Fahrenheit", symbol: "°F", category: "temperature" },
  { id: "kelvin", label: "Kelvin", symbol: "K", category: "temperature" },
  // Area (base: square meter)
  { id: "m2", label: "Square meters", symbol: "m²", category: "area" },
  { id: "cm2", label: "Square centimeters", symbol: "cm²", category: "area" },
  { id: "dm2", label: "Square decimeters", symbol: "dm²", category: "area" },
  { id: "km2", label: "Square kilometers", symbol: "km²", category: "area" },
  { id: "ft2", label: "Square feet", symbol: "ft²", category: "area" },
  { id: "in2", label: "Square inches", symbol: "in²", category: "area" },
  { id: "mi2", label: "Square miles", symbol: "mi²", category: "area" },
  { id: "hectare", label: "Hectares", symbol: "ha", category: "area" },
  { id: "acre", label: "Acres", symbol: "ac", category: "area" },
  // Volume (base: liter)
  { id: "l", label: "Liters", symbol: "L", category: "volume" },
  { id: "ml", label: "Milliliters", symbol: "mL", category: "volume" },
  { id: "m3", label: "Cubic meters", symbol: "m³", category: "volume" },
  { id: "cm3", label: "Cubic centimeters", symbol: "cm³", category: "volume" },
  { id: "dm3", label: "Cubic decimeters", symbol: "dm³", category: "volume" },
  { id: "ft3", label: "Cubic feet", symbol: "ft³", category: "volume" },
  { id: "in3", label: "Cubic inches", symbol: "in³", category: "volume" },
  { id: "gal", label: "US gallons", symbol: "gal", category: "volume" },
  { id: "qt", label: "US quarts", symbol: "qt", category: "volume" },
  { id: "pt", label: "US pints", symbol: "pt", category: "volume" },
  // Cooking (base: milliliter)
  { id: "tsp", label: "Teaspoons", symbol: "tsp", category: "cooking" },
  { id: "tbsp", label: "Tablespoons", symbol: "tbsp", category: "cooking" },
  { id: "cup", label: "Cups (US)", symbol: "cup", category: "cooking" },
  { id: "floz", label: "Fluid ounces (US)", symbol: "fl oz", category: "cooking" },
  // Speed (base: meter per second)
  { id: "mps", label: "Meters per second", symbol: "m/s", category: "speed" },
  { id: "kmh", label: "Kilometers per hour", symbol: "km/h", category: "speed" },
  { id: "mph", label: "Miles per hour", symbol: "mph", category: "speed" },
  { id: "knot", label: "Knots", symbol: "kn", category: "speed" },
  { id: "fps", label: "Feet per second", symbol: "ft/s", category: "speed" },
  // Pressure (base: pascal)
  { id: "pa", label: "Pascals", symbol: "Pa", category: "pressure" },
  { id: "kpa", label: "Kilopascals", symbol: "kPa", category: "pressure" },
  { id: "bar", label: "Bar", symbol: "bar", category: "pressure" },
  { id: "atm", label: "Atmospheres", symbol: "atm", category: "pressure" },
  { id: "psi", label: "Pounds per square inch", symbol: "psi", category: "pressure" },
  { id: "mmhg", label: "Millimeters of mercury", symbol: "mmHg", category: "pressure" },
  // Energy (base: joule)
  { id: "j", label: "Joules", symbol: "J", category: "energy" },
  { id: "kj", label: "Kilojoules", symbol: "kJ", category: "energy" },
  { id: "cal", label: "Calories", symbol: "cal", category: "energy" },
  { id: "kcal", label: "Kilocalories", symbol: "kcal", category: "energy" },
  { id: "wh", label: "Watt-hours", symbol: "Wh", category: "energy" },
  { id: "kwh", label: "Kilowatt-hours", symbol: "kWh", category: "energy" },
  // Power (base: watt)
  { id: "w", label: "Watts", symbol: "W", category: "power" },
  { id: "kw", label: "Kilowatts", symbol: "kW", category: "power" },
  { id: "hp", label: "Horsepower (mechanical)", symbol: "hp", category: "power" },
  { id: "ps", label: "Metric horsepower", symbol: "PS", category: "power" },
];

const UNIT_BY_ID = new Map(UNITS.map((u) => [u.id, u]));

export const CATEGORY_LABELS: Record<Category, string> = {
  length: "Length",
  mass: "Mass",
  temperature: "Temperature",
  area: "Area",
  volume: "Volume",
  cooking: "Cooking",
  speed: "Speed",
  pressure: "Pressure",
  energy: "Energy",
  power: "Power",
};

// Factor to convert one unit into its category's base unit.
// Bases: length = meter, mass = kilogram, area = square meter,
// volume = liter, cooking = milliliter, speed = meter/second,
// pressure = pascal, energy = joule, power = watt.
const TO_BASE_FACTOR: Record<string, number> = {
  cm: 0.01,
  dm: 0.1,
  inches: 0.0254,
  m: 1,
  feet: 0.3048,
  km: 1000,
  miles: 1609.344,
  nmi: 1852,
  kg: 1,
  lb: 0.45359237,
  g: 0.001,
  oz: 0.028349523125,
  // area (m²)
  m2: 1,
  cm2: 0.0001,
  dm2: 0.01,
  km2: 1_000_000,
  ft2: 0.09290304,
  in2: 0.00064516,
  mi2: 2_589_988.110336,
  hectare: 10_000,
  acre: 4046.8564224,
  // volume (L)
  l: 1,
  ml: 0.001,
  m3: 1000,
  cm3: 0.001,
  dm3: 1,
  ft3: 28.316846592,
  in3: 0.016387064,
  gal: 3.785411784,
  qt: 0.946352946,
  pt: 0.473176473,
  // cooking (mL)
  tsp: 4.92892159375,
  tbsp: 14.78676478125,
  cup: 236.5882365,
  floz: 29.5735295625,
  // speed (m/s)
  mps: 1,
  kmh: 0.2777777777777778,
  mph: 0.44704,
  knot: 0.5144444444444445,
  fps: 0.3048,
  // pressure (Pa)
  pa: 1,
  kpa: 1000,
  bar: 100_000,
  atm: 101_325,
  psi: 6894.757293168,
  mmhg: 133.322387415,
  // energy (J)
  j: 1,
  kj: 1000,
  cal: 4.184,
  kcal: 4184,
  wh: 3600,
  kwh: 3_600_000,
  // power (W)
  w: 1,
  kw: 1000,
  hp: 745.6998715822702,
  ps: 735.49875,
};

export function getUnit(id: string): Unit | undefined {
  return UNIT_BY_ID.get(id);
}

/**
 * Convert a value from one unit to another within the same category.
 * Factor-based categories go via a base unit; temperature uses explicit formulas.
 * Throws if the units belong to different categories.
 */
export function convert(value: number, from: Unit, to: Unit): number {
  if (from.category !== to.category) {
    throw new Error(
      `Cannot convert between categories: ${from.category} -> ${to.category}`,
    );
  }
  if (from.id === to.id) return value;

  if (from.category === "temperature") {
    return convertTemperature(value, from.id, to.id);
  }

  const base = value * TO_BASE_FACTOR[from.id];
  return base / TO_BASE_FACTOR[to.id];
}

function convertTemperature(value: number, fromId: string, toId: string): number {
  // Normalize to Celsius, then to target.
  let celsius: number;
  switch (fromId) {
    case "celsius":
      celsius = value;
      break;
    case "fahrenheit":
      celsius = (value - 32) * (5 / 9);
      break;
    case "kelvin":
      celsius = value - 273.15;
      break;
    default:
      throw new Error(`Unknown temperature unit: ${fromId}`);
  }

  switch (toId) {
    case "celsius":
      return celsius;
    case "fahrenheit":
      return celsius * (9 / 5) + 32;
    case "kelvin":
      return celsius + 273.15;
    default:
      throw new Error(`Unknown temperature unit: ${toId}`);
  }
}

export function slugFor(from: Unit, to: Unit): string {
  return `${from.id}-${to.id}`;
}

/** A "1 <from> = <n> <to>" worked example for previews (significant-digit trimmed). */
export function exampleFor(from: Unit, to: Unit): string {
  const value = convert(1, from, to);
  const formatted = new Intl.NumberFormat("en-US", {
    maximumSignificantDigits: 4,
  }).format(value);
  return `1 ${from.symbol} = ${formatted} ${to.symbol}`;
}

/** Human-readable formula describing how to convert `from` into `to`. */
export function describeConversion(from: Unit, to: Unit): string {
  if (from.id === to.id) return "Same unit — no conversion.";
  if (from.category === "temperature") {
    if (from.id === "celsius" && to.id === "fahrenheit") {
      return "°F = (°C × 9/5) + 32";
    }
    if (from.id === "fahrenheit" && to.id === "celsius") {
      return "°C = (°F − 32) × 5/9";
    }
    if (from.id === "celsius" && to.id === "kelvin") {
      return "K = °C + 273.15";
    }
    if (from.id === "kelvin" && to.id === "celsius") {
      return "°C = K − 273.15";
    }
    if (from.id === "fahrenheit" && to.id === "kelvin") {
      return "K = (°F − 32) × 5/9 + 273.15";
    }
    if (from.id === "kelvin" && to.id === "fahrenheit") {
      return "°F = (K − 273.15) × 9/5 + 32";
    }
  }
  const factor = TO_BASE_FACTOR[from.id] / TO_BASE_FACTOR[to.id];
  const rounded = Math.round(factor * 1e6) / 1e6;
  return `${to.symbol} = ${from.symbol} × ${rounded}`;
}

export type UnitPair = { from: Unit; to: Unit };

export function parseSlug(slug: string): UnitPair | null {
  const parts = slug.split("-");
  if (parts.length !== 2) return null;
  const from = getUnit(parts[0]);
  const to = getUnit(parts[1]);
  if (!from || !to) return null;
  if (from.category !== to.category) return null;
  if (from.id === to.id) return null;
  return { from, to };
}

/** All valid from->to pairs within the same category (excludes identity pairs). */
export function getConversionPairs(): UnitPair[] {
  const pairs: UnitPair[] = [];
  for (const from of UNITS) {
    for (const to of UNITS) {
      if (from.category === to.category && from.id !== to.id) {
        pairs.push({ from, to });
      }
    }
  }
  return pairs;
}

/** Curated list of the most commonly used converters, in display order. */
export const POPULAR_SLUGS = [
  "cm-inches",
  "kg-lb",
  "celsius-fahrenheit",
  "km-miles",
  "l-gal",
  "m2-ft2",
  "kmh-mph",
  "cup-tbsp",
  "kwh-kcal",
  "bar-psi",
  "g-oz",
  "hp-kw",
] as const;

/** Resolve the curated popular slugs to valid unit pairs. */
export function getPopularPairs(): UnitPair[] {
  return POPULAR_SLUGS.map(parseSlug).filter(
    (p): p is UnitPair => p !== null,
  );
}
