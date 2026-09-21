import type { ReactNode } from "react";
import {
  DefinitionCallout,
  DefinitionSection,
} from "../../components/definitions/DefinitionContent";
import { CATEGORY_LABELS, UNITS, type Unit } from "../../lib/units";

export type DefinitionStatus = "draft" | "published";

export type MeasurementSystem =
  | "SI"
  | "Metric (non-SI)"
  | "Imperial"
  | "Imperial and US customary"
  | "US customary"
  | "Nautical"
  | "Cooking"
  | "Other";

export type SiClassification =
  | "SI base unit"
  | "SI derived unit"
  | "Coherent SI derived unit"
  | "Prefixed SI unit"
  | "Non-SI unit accepted for use with SI"
  | "Non-SI unit";

export type DefinitionSource = {
  title: string;
  url: string;
  publisher?: string;
};

type DefinitionContent = {
  status: DefinitionStatus;
  name?: string;
  definition?: string;
  measurementSystem?: MeasurementSystem;
  siClassification?: SiClassification;
  referenceUnit?: string;
  exactRelationship?: string;
  formulaNotes?: string;
  commonUses?: string[];
  regions?: string[];
  history?: string;
  namingNotes?: string;
  variants?: string[];
  precisionNotes?: string;
  reviewedAt?: string;
  sources?: DefinitionSource[];
  content?: ReactNode;
};

type DefinitionContentEntry = DefinitionContent & {
  unitId: string;
};

export type UnitDefinition = DefinitionContent & {
  unit: Unit;
  quantity: string;
};

// Add editorial content here, keyed by the existing converter unit ID.
// Keep entries as drafts until all required published fields are reviewed.
const DEFINITION_CONTENT: DefinitionContentEntry[] = [
  {
    unitId: "m",
    status: "published",
    name: "Meter",
    definition:
      "The meter (m) is the SI base unit of length. It is defined using the fixed value of the speed of light in vacuum.",
    measurementSystem: "SI",
    siClassification: "SI base unit",
    referenceUnit: "SI base unit for length",
    exactRelationship: "c = 299,792,458 m/s exactly",
    formulaNotes:
      "One meter is the distance light travels in vacuum during 1/299,792,458 of a second.",
    commonUses: [
      "Dimensions of rooms, buildings, and land",
      "Short travel and sporting distances",
      "Elevation and altitude",
      "Scientific and engineering measurements",
    ],
    regions: ["Worldwide"],
    history:
      "The meter originated in the French metric system. Its definition moved from physical standards to wavelengths of light, and in 1983 it was defined using the speed of light. The wording was reformulated for the revised SI in 2019.",
    namingNotes:
      'The SI Brochure uses the international spelling "metre"; NIST uses "meter" in the United States. Both use the symbol m.',
    variants: [
      'Meter can also mean a measuring instrument in English; "metre" refers specifically to the unit.',
    ],
    precisionNotes:
      "Conversions based on exact definitions, such as 1 meter = 100 centimeters and 1 inch = 0.0254 meter, do not introduce conversion-factor uncertainty.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "SI base unit: metre (m)",
        url: "https://www.bipm.org/en/si-base-units/metre",
        publisher: "BIPM",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="How the meter is defined">
          <p>
            The speed of light in vacuum, <i>c</i>, has the exact value
            299,792,458 meters per second. Because the second is independently
            defined using the caesium-133 atom, this fixes the length of one
            meter without relying on a physical measuring bar.
          </p>
          <DefinitionCallout title="In practical terms">
            <p>
              One meter is the distance light travels in vacuum in
              1/299,792,458 of a second.
            </p>
          </DefinitionCallout>
        </DefinitionSection>

        <DefinitionSection title="Meter relationships">
          <p>Metric prefixes create larger and smaller units from the meter:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>1 meter = 100 centimeters</li>
            <li>1 meter = 1,000 millimeters</li>
            <li>1 kilometer = 1,000 meters</li>
          </ul>
          <p>
            The international inch is defined as exactly 0.0254 meter, which
            provides an exact relationship between the SI and
            inch-based systems.
          </p>
        </DefinitionSection>

        <DefinitionSection title="Where meters are used">
          <p>
            Meters are used worldwide for everyday, technical, and scientific
            measurements. Common examples include room dimensions, building
            heights, short travel distances, running events, elevation, and
            engineering specifications.
          </p>
        </DefinitionSection>

        <DefinitionSection title="Meter or metre?">
          <p>
            The international SI spelling is <i>metre</i>. <i>Meter</i> is the
            spelling used by NIST and in American English. The unit symbol is
            always <strong>m</strong>, with no period or plural form.
          </p>
        </DefinitionSection>

        <DefinitionSection title="A short history">
          <p>
            The meter originated in the French metric system in the late
            eighteenth century. It was represented by physical standards and
            later by a wavelength of light before the 1983 definition linked it
            to the speed of light. The revised SI reformulated the wording in
            2019 while preserving the same meter.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "kg",
    status: "published",
    name: "Kilogram",
    definition:
      "The kilogram (kg) is the SI base unit of mass. It is the only SI base unit still defined by a physical artifact in the historical form, and the current SI definition fixes the Planck constant.",
    measurementSystem: "SI",
    siClassification: "SI base unit",
    referenceUnit: "SI base unit for mass",
    exactRelationship: "1 kg = 1,000 g exactly",
    formulaNotes:
      "One kilogram is equal to 1,000 grams. One gram is one-thousandth of a kilogram.",
    commonUses: [
      "Food and grocery weights",
      "Body mass and health measurements",
      "Industrial and laboratory mass",
      "Shipping and freight loads",
    ],
    regions: ["Worldwide"],
    history:
      "The kilogram was historically defined using the International Prototype of the Kilogram, a platinum-iridium cylinder kept by the BIPM. In 2019 the SI redefinition tied the kilogram to the fixed numerical value of the Planck constant, eliminating dependence on the artifact.",
    namingNotes:
      'The unit name is "kilogram" and the symbol is kg. The symbol is written without a period and is not pluralized in SI notation.',
    variants: [
      "The kilogram is distinct from the gram and milligram, which are decimal fractions of it.",
      "In some everyday contexts, kilograms are colloquially shortened to 'kilos'.",
    ],
    precisionNotes:
      "The kilogram is a base unit in the SI and is defined with fixed Planck-constant exactness; common conversions like 1 kg = 1,000 g are exact.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "SI base units: kilogram (kg)",
        url: "https://www.bipm.org/en/si-base-units/kilogram",
        publisher: "BIPM",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the kilogram is">
          <p>
            The kilogram is the SI base unit of mass. It is the standard unit
            used for everyday weights, scientific measurements, and many
            industrial applications.
          </p>
          <DefinitionCallout title="Exact relationship">
            <p>1 kilogram = 1,000 grams exactly.</p>
          </DefinitionCallout>
        </DefinitionSection>

        <DefinitionSection title="SI definition and modern precision">
          <p>
            The kilogram was historically defined by a physical artifact, but the
            2019 SI revision redefined it using the fixed numerical value of the
            Planck constant. This keeps the unit consistent and independent from
            a single metal object.
          </p>
        </DefinitionSection>

        <DefinitionSection title="How it relates to other units">
          <p>
            The kilogram is the basis for the decimal SI mass system. Common
            subdivisions include the gram, milligram, and tonne, while larger
            units such as the metric ton are defined in multiples of kilograms.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>1 kilogram = 1,000 grams</li>
            <li>1 gram = 0.001 kilogram</li>
            <li>1 tonne = 1,000 kilograms</li>
          </ul>
        </DefinitionSection>

        <DefinitionSection title="Everyday use">
          <p>
            Kilograms are used in grocery shopping, body weight, shipping,
            science labs, and a wide range of engineering calculations. It is a
            universal practical unit for mass in most countries and in the SI.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "feet",
    status: "published",
    name: "Foot",
    definition:
      "The foot (ft) is a non-SI unit of length equal to exactly 0.3048 meters in the international definition.",
    measurementSystem: "Imperial and US customary",
    siClassification: "Non-SI unit",
    referenceUnit: "Meter",
    exactRelationship: "1 ft = 0.3048 m exactly",
    formulaNotes: "To convert feet to meters, multiply the value in feet by 0.3048.",
    commonUses: [
      "Building dimensions and construction",
      "Human height",
      "Aviation altitude",
      "Sports fields and distances",
    ],
    regions: ["United States", "United Kingdom", "Canada", "Australia"],
    history:
      "The foot is an ancient human-scale length unit with different historical values. The international foot was standardized as exactly 0.3048 meters in 1959, replacing regional variations for most technical use.",
    namingNotes:
      'The unit name is "foot" in the singular and "feet" in the plural. Its symbol is ft; the prime mark (′) is also common in informal notation.',
    variants: [
      "The international foot is exactly 0.3048 meters.",
      "The U.S. survey foot was exactly 1200/3937 meters and was retired from new U.S. federal use on January 1, 2023; legacy data may still use it.",
    ],
    precisionNotes:
      "The international-foot conversion to meters is exact. Surveying and geospatial work should identify whether legacy measurements use the U.S. survey foot.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "U.S. Survey Foot",
        url: "https://www.nist.gov/pml/us-surveyfoot",
        publisher: "NIST",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="The international foot">
          <p>
            The international foot is defined as exactly 0.3048 meters. This
            definition has been used since 1959 and is the standard conversion
            for general, construction, aviation, and everyday measurements.
          </p>
          <DefinitionCallout title="Exact conversion">
            <p>1 foot = 0.3048 meters, exactly.</p>
          </DefinitionCallout>
        </DefinitionSection>

        <DefinitionSection title="International foot and U.S. survey foot">
          <p>
            Historical surveying records may use the U.S. survey foot, which
            was defined as exactly 1,200/3,937 meters. It is slightly longer
            than the international foot and was retired from new U.S. federal
            use in 2023. Always identify the variant when working with
            geospatial or legacy data.
          </p>
        </DefinitionSection>

        <DefinitionSection title="Where feet are used">
          <p>
            Feet remain common in the United States and are also used in
            specific contexts in countries that otherwise use the metric
            system, such as aviation altitude and some construction or
            property measurements.
          </p>
        </DefinitionSection>

        <DefinitionSection title="Feet, inches, and notation">
          <p>
            A foot contains 12 inches. In informal measurements, feet and
            inches may be written with prime and double-prime marks, such as
            6′ 2″ for six feet two inches. The abbreviation <strong>ft</strong>{" "}
            is unambiguous in technical writing.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "cm",
    status: "published",
    name: "Centimeter",
    definition:
      "The centimeter is a decimal subdivision of the meter used for small everyday measurements.",
    measurementSystem: "SI",
    siClassification: "Prefixed SI unit",
    referenceUnit: "Meter",
    exactRelationship: "1 cm = 0.01 m exactly",
    formulaNotes: "Multiply centimeters by 0.01 to convert to meters.",
    commonUses: [
      "Small object dimensions",
      "Education and lab measurements",
      "Body and clothing measurements",
    ],
    regions: ["Worldwide"],
    history:
      "The centimeter is part of the metric system and was designed to make decimal length calculations easier in everyday use.",
    namingNotes:
      "The prefix centi- means one hundredth, so a centimeter is one-hundredth of a meter.",
    variants: ["The centimeter is widely used in school, lab, and technical work."],
    precisionNotes: "The centimeter is exactly 0.01 meter.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "SI prefixes and decimal units",
        url: "https://www.bipm.org/en/si-prefixes",
        publisher: "BIPM",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the centimeter is">
          <p>
            The centimeter is a practical metric unit for small lengths. It is
            especially useful when precise but everyday measurements are needed.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "dm",
    status: "published",
    name: "Decimeter",
    definition:
      "The decimeter is a metric length unit equal to one-tenth of a meter.",
    measurementSystem: "SI",
    siClassification: "Prefixed SI unit",
    referenceUnit: "Meter",
    exactRelationship: "1 dm = 0.1 m exactly",
    formulaNotes: "Multiply decimeters by 0.1 to convert to meters.",
    commonUses: [
      "Education",
      "Simple metric teaching examples",
      "Intermediate-length measurements",
    ],
    regions: ["Worldwide"],
    history:
      "The decimeter is part of the decimal metric system and helps demonstrate the relationship between larger and smaller length units.",
    namingNotes:
      "The prefix deci- means one tenth, so a decimeter is one-tenth of a meter.",
    variants: ["The decimeter is usually less common in everyday measurement than the centimeter or meter."],
    precisionNotes: "The decimeter is exactly 0.1 meter.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "SI prefixes and decimal units",
        url: "https://www.bipm.org/en/si-prefixes",
        publisher: "BIPM",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the decimeter is">
          <p>
            The decimeter is a metric unit for lengths between the centimeter and
            meter, commonly used in education and measurement practice.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "inches",
    status: "published",
    name: "Inch",
    definition:
      "The inch is a unit of length in the imperial and US customary systems, defined as exactly 25.4 millimeters.",
    measurementSystem: "Imperial and US customary",
    siClassification: "Non-SI unit",
    referenceUnit: "Meter",
    exactRelationship: "1 in = 0.0254 m exactly",
    formulaNotes: "Multiply inches by 0.0254 to convert to meters.",
    commonUses: [
      "Screen sizes",
      "Construction",
      "Hardware and product dimensions",
    ],
    regions: ["United States", "United Kingdom"],
    history:
      "The inch has a long historical origin and was standardized internationally in the 20th century.",
    namingNotes:
      "The symbol is in and it is commonly used in inch-based measurement systems.",
    variants: ["The inch is also used in combination with feet and yards in customary systems."],
    precisionNotes: "The international inch is exactly 0.0254 meter.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "NIST Guide to the SI",
        url: "https://www.nist.gov/pml/owm/guide-si",
        publisher: "NIST",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the inch is">
          <p>
            The inch is a common small-unit measurement in everyday US and UK
            contexts, especially for screens, hardware, and construction.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "km",
    status: "published",
    name: "Kilometer",
    definition:
      "The kilometer is a metric length unit equal to 1,000 meters and used for long distances.",
    measurementSystem: "SI",
    siClassification: "Prefixed SI unit",
    referenceUnit: "Meter",
    exactRelationship: "1 km = 1,000 m exactly",
    formulaNotes: "Multiply kilometers by 1,000 to convert to meters.",
    commonUses: [
      "Road distances",
      "Travel and mapping",
      "Geography and route planning",
    ],
    regions: ["Worldwide"],
    history:
      "The kilometer was introduced as part of the metric system to provide a practical unit for long-distance travel and geography.",
    namingNotes:
      "The prefix kilo- means one thousand, so a kilometer is 1,000 meters.",
    variants: ["The kilometer is the standard long-distance metric unit in most countries."],
    precisionNotes: "The kilometer is exactly 1,000 meters.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "SI prefixes and decimal units",
        url: "https://www.bipm.org/en/si-prefixes",
        publisher: "BIPM",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the kilometer is">
          <p>
            The kilometer is the standard metric unit for medium and long
            distances, used in road travel, geography, and everyday navigation.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "nmi",
    status: "published",
    name: "Nautical mile",
    definition:
      "The nautical mile is a navigation unit equal to exactly 1,852 meters.",
    measurementSystem: "Nautical",
    siClassification: "Non-SI unit",
    referenceUnit: "Meter",
    exactRelationship: "1 nmi = 1,852 m exactly",
    formulaNotes: "Multiply nautical miles by 1,852 to convert to meters.",
    commonUses: [
      "Marine navigation",
      "Aviation route planning",
      "Charts and geodesy",
    ],
    regions: ["Worldwide"],
    history:
      "The nautical mile developed from navigation needs and is tied to Earth-based angular measurements rather than land distance conventions.",
    namingNotes:
      "The symbol is nmi and it is used for navigation rather than everyday land distance.",
    variants: ["Nautical miles are not the same as statute miles and are designed specifically for navigation."],
    precisionNotes: "The nautical mile is exactly 1,852 meters.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "Nautical mile definition",
        url: "https://www.britannica.com/science/nautical-mile",
        publisher: "Encyclopedia Britannica",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="Why the nautical mile matters">
          <p>
            The nautical mile is used because it aligns closely with angular
            distance on Earth, which makes it practical for navigation and air/sea
            travel.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "miles",
    status: "published",
    name: "Mile",
    definition:
      "The mile is a long-distance unit in the imperial and US customary systems, equal to exactly 1,609.344 meters.",
    measurementSystem: "Imperial and US customary",
    siClassification: "Non-SI unit",
    referenceUnit: "Meter",
    exactRelationship: "1 mi = 1,609.344 m exactly",
    formulaNotes: "Multiply miles by 1,609.344 to convert to meters.",
    commonUses: [
      "Road distances",
      "Running and travel",
      "Geographic reports",
    ],
    regions: ["United States", "United Kingdom"],
    history:
      "The mile has ancient roots and was standardized in modern form for road and land measurement in imperial and customary systems.",
    namingNotes:
      "The symbol is mi and it is commonly used for road distance and travel.",
    variants: ["The mile is different from the nautical mile and from metric road distances."],
    precisionNotes: "The international mile is exactly 1,609.344 meters.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
      {
        title: "NIST Guide to the SI",
        url: "https://www.nist.gov/pml/owm/guide-si",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the mile is">
          <p>
            The mile remains common in road-distance and travel contexts in several
            countries, even though the meter and kilometer are the standard SI
            length units.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "lb",
    status: "published",
    name: "Pound",
    definition:
      "The pound is a mass unit in the imperial and US customary systems, equal to exactly 0.45359237 kilograms.",
    measurementSystem: "Imperial and US customary",
    siClassification: "Non-SI unit",
    referenceUnit: "Kilogram",
    exactRelationship: "1 lb = 0.45359237 kg exactly",
    formulaNotes: "Multiply pounds by 0.45359237 to convert to kilograms.",
    commonUses: [
      "Body weight",
      "Parcel shipping",
      "Retail goods",
    ],
    regions: ["United States", "United Kingdom"],
    history:
      "The pound developed from older trade weights and was standardized in modern measurement systems.",
    namingNotes:
      "The symbol is lb and it is the principal mass unit in several customary systems.",
    variants: ["The pound should not be confused with the pound-force or other historical weight units."],
    precisionNotes: "The international pound is exactly 0.45359237 kilograms.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "NIST Guide to the SI",
        url: "https://www.nist.gov/pml/owm/guide-si",
        publisher: "NIST",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the pound is">
          <p>
            Pounds are widely used for body weight, shipping, and everyday mass
            measurement in customary systems, while kilograms dominate the SI world.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "g",
    status: "published",
    name: "Gram",
    definition:
      "The gram is a metric mass unit equal to one-thousandth of a kilogram.",
    measurementSystem: "SI",
    siClassification: "Prefixed SI unit",
    referenceUnit: "Kilogram",
    exactRelationship: "1 g = 0.001 kg exactly",
    formulaNotes: "Multiply grams by 0.001 to convert to kilograms.",
    commonUses: [
      "Food labeling",
      "Science and lab work",
      "Small quantities of mass",
    ],
    regions: ["Worldwide"],
    history:
      "The gram is part of the metric system and was designed to provide practical decimal mass units.",
    namingNotes:
      "The symbol is g and the gram is the most common everyday metric mass unit below the kilogram.",
    variants: ["The gram is the base for milligrams and kilograms in the decimal metric system."],
    precisionNotes: "The gram is exactly one-thousandth of a kilogram.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "SI prefixes and decimal units",
        url: "https://www.bipm.org/en/si-prefixes",
        publisher: "BIPM",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the gram is">
          <p>
            The gram is the common metric measurement for small masses in food,
            science, and everyday consumer measurement.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "oz",
    status: "published",
    name: "Ounce",
    definition:
      "The ounce is a customary mass unit equal to exactly 28.349523125 grams.",
    measurementSystem: "Imperial and US customary",
    siClassification: "Non-SI unit",
    referenceUnit: "Kilogram",
    exactRelationship: "1 oz = 0.028349523125 kg exactly",
    formulaNotes: "Multiply ounces by 0.028349523125 to convert to kilograms.",
    commonUses: [
      "Food portions",
      "Packaging",
      "Commodity weights",
    ],
    regions: ["United States", "United Kingdom"],
    history:
      "The ounce developed from older trade and household mass systems and remains common in customary commerce.",
    namingNotes:
      "The symbol is oz, and the ounce is distinct from the fluid ounce used for volume.",
    variants: ["The mass ounce is different from the fluid ounce; do not confuse them."],
    precisionNotes: "The avoirdupois ounce is exactly 28.349523125 grams.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
      {
        title: "NIST Guide to the SI",
        url: "https://www.nist.gov/pml/owm/guide-si",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the ounce is">
          <p>
            The ounce is a familiar unit for small mass measurements in food,
            packaging, and customary-weight contexts.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "celsius",
    status: "published",
    name: "Celsius",
    definition:
      "The Celsius scale is a temperature scale where water freezes at 0 °C and boils at 100 °C at standard atmospheric pressure.",
    measurementSystem: "SI",
    siClassification: "SI derived unit",
    referenceUnit: "Kelvin",
    exactRelationship: "°C = K - 273.15",
    formulaNotes: "Add 273.15 to convert Celsius to Kelvin, or subtract 273.15 for Kelvin to Celsius.",
    commonUses: [
      "Weather",
      "Cooking",
      "Scientific and medical use",
    ],
    regions: ["Worldwide"],
    history:
      "The Celsius scale was introduced in the 18th century and remains the most common everyday temperature scale worldwide.",
    namingNotes:
      "The symbol is °C and the scale is named after Anders Celsius.",
    variants: ["Celsius is commonly used in everyday life, while Kelvin is used in thermodynamics and science."],
    precisionNotes: "Celsius values are often converted to Kelvin for thermodynamic calculations.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "SI Units: Temperature",
        url: "https://www.nist.gov/pml/owm/si-units-temperature",
        publisher: "NIST",
      },
      {
        title: "SI base unit: kelvin (K)",
        url: "https://www.bipm.org/en/si-base-units/kelvin",
        publisher: "BIPM",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What Celsius means">
          <p>
            Celsius is the most common daily temperature scale and is accepted for
            use with SI, especially for weather, food, health, and science.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "fahrenheit",
    status: "published",
    name: "Fahrenheit",
    definition:
      "The Fahrenheit scale is a temperature scale used especially in the United States and a few other countries.",
    measurementSystem: "Imperial and US customary",
    siClassification: "Non-SI unit",
    referenceUnit: "Kelvin",
    exactRelationship: "°F = (°C × 9/5) + 32",
    formulaNotes: "Subtract 32 and multiply by 5/9 to convert Fahrenheit to Celsius.",
    commonUses: [
      "Weather reports",
      "Cooking and home temperatures",
      "US household values",
    ],
    regions: ["United States"],
    history:
      "The Fahrenheit scale was developed in the 18th century and became standard in the US for daily temperature reporting.",
    namingNotes:
      "The symbol is °F and the scale is named for Daniel Gabriel Fahrenheit.",
    variants: ["Fahrenheit is not the standard scientific temperature scale outside a few countries."],
    precisionNotes: "For scientific work, Fahrenheit values are usually converted to Celsius or Kelvin.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "NIST Guide to the SI",
        url: "https://www.nist.gov/pml/owm/guide-si",
        publisher: "NIST",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What Fahrenheit means">
          <p>
            Fahrenheit is still common in the US for everyday temperatures, but
            scientific and international work generally uses Celsius or Kelvin.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "kelvin",
    status: "published",
    name: "Kelvin",
    definition:
      "The kelvin is the SI base unit of thermodynamic temperature and starts at absolute zero.",
    measurementSystem: "SI",
    siClassification: "SI base unit",
    referenceUnit: "Kelvin",
    exactRelationship: "K = °C + 273.15",
    formulaNotes: "Subtract 273.15 to convert Kelvin to Celsius.",
    commonUses: [
      "Physics",
      "Chemistry",
      "Engineering and thermodynamics",
    ],
    regions: ["Worldwide"],
    history:
      "The kelvin was adopted as the SI unit for absolute temperature and is fundamental for scientific work.",
    namingNotes:
      "The symbol is K and it is written without a degree sign in SI usage.",
    variants: ["The kelvin scale has the same step size as Celsius, but a different zero point."],
    precisionNotes: "Kelvin is the standard SI unit for thermodynamic temperature.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "SI base units and derived units",
        url: "https://www.bipm.org/en/si-base-units",
        publisher: "BIPM",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What kelvin means">
          <p>
            Kelvin is the standard SI basis for temperature in physics and
            engineering because it starts at absolute zero and avoids negative
            values in thermodynamic calculations.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "m2",
    status: "published",
    name: "Square meter",
    definition:
      "The square meter is the SI unit of area, equal to the area of a square with sides one meter long.",
    measurementSystem: "SI",
    siClassification: "SI derived unit",
    referenceUnit: "Square meter",
    exactRelationship: "1 m² = 1 m × 1 m",
    formulaNotes: "Area in square meters is length in meters multiplied by width in meters.",
    commonUses: [
      "Room sizes",
      "Property area",
      "Construction and engineering",
    ],
    regions: ["Worldwide"],
    history:
      "The square meter follows directly from the meter and is the base unit for geometric area in SI.",
    namingNotes:
      "The symbol is m² and is written as square meter in plain text.",
    variants: ["Square centimeter and square kilometer are common metric subunits and multiples."],
    precisionNotes: "The square meter is the coherent SI unit of area.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "SI base units and derived units",
        url: "https://www.bipm.org/en/si-base-units",
        publisher: "BIPM",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the square meter is">
          <p>
            The square meter is the standard unit for area in SI and is used across
            construction, land measurement, and technical design.
          </p>
        </DefinitionSection>

      </>
    ),
  },
  {
    unitId: "cm2",
    status: "published",
    name: "Square centimeter",
    definition:
      "The square centimeter is a metric area unit equal to one-hundredth of a square meter.",
    measurementSystem: "SI",
    siClassification: "Prefixed SI unit",
    referenceUnit: "Square meter",
    exactRelationship: "1 cm² = 0.0001 m² exactly",
    formulaNotes: "Multiply square centimeters by 0.0001 to convert to square meters.",
    commonUses: [
      "Small areas",
      "Science and education",
      "Technical diagrams",
    ],
    regions: ["Worldwide"],
    history:
      "The square centimeter is part of the decimal metric area system and is useful for small, precise areas.",
    namingNotes:
      "The symbol is cm² and it is one hundredth of a square meter.",
    variants: ["Square centimeters are often used for teaching and smaller surface-area calculations."],
    precisionNotes: "One square centimeter is exactly 0.0001 square meter.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "SI prefixes and decimal units",
        url: "https://www.bipm.org/en/si-prefixes",
        publisher: "BIPM",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the square centimeter is">
          <p>
            The square centimeter is a small metric area unit useful for precise
            but compact measurements.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "dm2",
    status: "published",
    name: "Square decimeter",
    definition:
      "The square decimeter is a metric area unit equal to one-hundredth of a square meter.",
    measurementSystem: "SI",
    siClassification: "Prefixed SI unit",
    referenceUnit: "Square meter",
    exactRelationship: "1 dm² = 0.01 m² exactly",
    formulaNotes: "Multiply square decimeters by 0.01 to convert to square meters.",
    commonUses: [
      "Intermediate area values",
      "Education",
      "Technical calculations",
    ],
    regions: ["Worldwide"],
    history:
      "The square decimeter is part of the decimal metric system and sits between the square centimeter and square meter.",
    namingNotes:
      "The symbol is dm² and it is one-hundredth of a square meter.",
    variants: ["It is less common in everyday use than the square meter or square centimeter."],
    precisionNotes: "One square decimeter is exactly 0.01 square meter.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "SI prefixes and decimal units",
        url: "https://www.bipm.org/en/si-prefixes",
        publisher: "BIPM",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the square decimeter is">
          <p>
            The square decimeter is a convenient metric area unit for intermediate
            values between small and larger surface measurements.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "km2",
    status: "published",
    name: "Square kilometer",
    definition:
      "The square kilometer is a metric area unit equal to 1,000,000 square meters.",
    measurementSystem: "SI",
    siClassification: "Prefixed SI unit",
    referenceUnit: "Square meter",
    exactRelationship: "1 km² = 1,000,000 m² exactly",
    formulaNotes: "Multiply square kilometers by 1,000,000 to convert to square meters.",
    commonUses: [
      "Large geographies",
      "Land area",
      "Regional and environmental planning",
    ],
    regions: ["Worldwide"],
    history:
      "The square kilometer is useful for areas too large for square meters yet still consistent with metric decimal structure.",
    namingNotes:
      "The symbol is km² and it is one million square meters.",
    variants: ["Large land areas are also often reported in hectares."],
    precisionNotes: "One square kilometer is exactly 1,000,000 square meters.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "SI prefixes and decimal units",
        url: "https://www.bipm.org/en/si-prefixes",
        publisher: "BIPM",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the square kilometer is">
          <p>
            The square kilometer is the metric unit for large land areas such as
            cities, regions, and geographical reporting.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "ft2",
    status: "published",
    name: "Square foot",
    definition:
      "The square foot is a customary area unit equal to the area of a square one foot on each side.",
    measurementSystem: "Imperial and US customary",
    siClassification: "Non-SI unit",
    referenceUnit: "Square meter",
    exactRelationship: "1 ft² = 0.09290304 m² exactly",
    formulaNotes: "Multiply square feet by 0.09290304 to convert to square meters.",
    commonUses: [
      "Floor area",
      "Property measurements",
      "Construction and real estate",
    ],
    regions: ["United States", "United Kingdom"],
    history:
      "The square foot is derived from the foot and remains common in property, building, and architectural work.",
    namingNotes:
      "The symbol is ft² and it is the square of the foot.",
    variants: ["Square footage is a common term in property and building discussion."],
    precisionNotes: "One square foot is exactly 0.09290304 square meter.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "NIST Guide to the SI",
        url: "https://www.nist.gov/pml/owm/guide-si",
        publisher: "NIST",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the square foot is">
          <p>
            The square foot is a familiar area unit in construction and property
            contexts, especially where customary units remain common.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "in2",
    status: "published",
    name: "Square inch",
    definition:
      "The square inch is a customary area unit equal to the area of a square one inch on each side.",
    measurementSystem: "Imperial and US customary",
    siClassification: "Non-SI unit",
    referenceUnit: "Square meter",
    exactRelationship: "1 in² = 0.00064516 m² exactly",
    formulaNotes: "Multiply square inches by 0.00064516 to convert to square meters.",
    commonUses: [
      "Engineering",
      "Material specification",
      "Small technical areas",
    ],
    regions: ["United States", "United Kingdom"],
    history:
      "The square inch is derived from the inch and is used when very small area values need precision.",
    namingNotes:
      "The symbol is in² and it is the square of the inch.",
    variants: ["Square inches are useful for tight product and material specifications."],
    precisionNotes: "One square inch is exactly 0.00064516 square meter.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "NIST Guide to the SI",
        url: "https://www.nist.gov/pml/owm/guide-si",
        publisher: "NIST",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the square inch is">
          <p>
            The square inch is a standard small-area unit in technical drawings and
            engineering specifications.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "mi2",
    status: "published",
    name: "Square mile",
    definition:
      "The square mile is a customary area unit equal to the area of a square one mile on each side.",
    measurementSystem: "Imperial and US customary",
    siClassification: "Non-SI unit",
    referenceUnit: "Square meter",
    exactRelationship: "1 mi² = 2,589,988.110336 m² exactly",
    formulaNotes: "Multiply square miles by 2,589,988.110336 to convert to square meters.",
    commonUses: [
      "Geography",
      "Large land area",
      "Regional reporting",
    ],
    regions: ["United States", "United Kingdom"],
    history:
      "The square mile grew from the historical mile and is still used for large land-area reporting.",
    namingNotes:
      "The symbol is mi² and it is the square of the mile.",
    variants: ["Large land areas are also reported in square kilometers in metric systems."],
    precisionNotes: "One square mile is exactly 2,589,988.110336 square meters.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "NIST Guide to the SI",
        url: "https://www.nist.gov/pml/owm/guide-si",
        publisher: "NIST",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the square mile is">
          <p>
            The square mile is used for very large land measurements in customary
            systems, especially in geographic and regional reporting.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "hectare",
    status: "published",
    name: "Hectare",
    definition:
      "The hectare is a metric land-area unit equal to 10,000 square meters.",
    measurementSystem: "SI",
    siClassification: "Non-SI unit accepted for use with SI",
    referenceUnit: "Square meter",
    exactRelationship: "1 ha = 10,000 m² exactly",
    formulaNotes: "Multiply hectares by 10,000 to convert to square meters.",
    commonUses: [
      "Agriculture",
      "Land parcels",
      "Property and forestry",
    ],
    regions: ["Worldwide"],
    history:
      "The hectare was created as a practical metric area unit for land and agriculture.",
    namingNotes:
      "The symbol is ha and it is widely used for land area measurement.",
    variants: ["Hectares are often preferred over square kilometers for land parcel sizes."],
    precisionNotes: "One hectare is exactly 10,000 square meters.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "SI prefixes and decimal units",
        url: "https://www.bipm.org/en/si-prefixes",
        publisher: "BIPM",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the hectare is">
          <p>
            The hectare is a practical metric unit for land area and is especially
            common in agriculture, forestry, and land management.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "acre",
    status: "published",
    name: "Acre",
    definition:
      "The acre is a customary land-area unit equal to 4,046.8564224 square meters.",
    measurementSystem: "Imperial and US customary",
    siClassification: "Non-SI unit accepted for use with SI",
    referenceUnit: "Square meter",
    exactRelationship: "1 ac = 4,046.8564224 m² exactly",
    formulaNotes: "Multiply acres by 4,046.8564224 to convert to square meters.",
    commonUses: [
      "Land parcels",
      "Agriculture",
      "Real estate",
    ],
    regions: ["United States", "United Kingdom"],
    history:
      "The acre developed from historical land-measurement systems and remains common in rural and property contexts.",
    namingNotes:
      "The symbol is ac and it remains widely used for land area in customary systems.",
    variants: ["Acres are often used where hectares are uncommon in customary practices."],
    precisionNotes: "One acre is exactly 4,046.8564224 square meters.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "NIST Guide to the SI",
        url: "https://www.nist.gov/pml/owm/guide-si",
        publisher: "NIST",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the acre is">
          <p>
            The acre remains common for land and property measurements in the US and
            other customary-using regions.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "l",
    status: "published",
    name: "Liter",
    definition:
      "The liter is a metric volume unit equal to one cubic decimeter and 0.001 cubic meter.",
    measurementSystem: "SI",
    siClassification: "Non-SI unit accepted for use with SI",
    referenceUnit: "Cubic meter",
    exactRelationship: "1 L = 0.001 m³ exactly",
    formulaNotes: "Multiply liters by 0.001 to convert to cubic meters.",
    commonUses: [
      "Beverages",
      "Cooking",
      "Laboratory fluids",
    ],
    regions: ["Worldwide"],
    history:
      "The liter was established as a practical metric volume unit and remains one of the most familiar everyday measures.",
    namingNotes:
      "The symbol is L to avoid confusion with the numeral 1.",
    variants: ["The liter is commonly used for everyday liquids even though cubic meters are the SI base measure for volume."],
    precisionNotes: "One liter is exactly one cubic decimeter and 0.001 cubic meter.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
      {
        title: "SI base units and derived units",
        url: "https://www.bipm.org/en/si-base-units",
        publisher: "BIPM",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the liter is">
          <p>
            The liter is an everyday volume unit used around the world for drinks,
            recipes, laboratory work, and general liquid measurements.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "ml",
    status: "published",
    name: "Milliliter",
    definition:
      "The milliliter is a metric volume unit equal to one-thousandth of a liter.",
    measurementSystem: "SI",
    siClassification: "Prefixed SI unit",
    referenceUnit: "Cubic meter",
    exactRelationship: "1 mL = 0.001 L exactly",
    formulaNotes: "Multiply milliliters by 0.001 to convert to liters.",
    commonUses: [
      "Medicine",
      "Recipes",
      "Small liquid quantities",
    ],
    regions: ["Worldwide"],
    history:
      "The milliliter follows the decimal metric system and is useful when only small amounts of liquid are involved.",
    namingNotes:
      "The symbol is mL and it is equivalent to one cubic centimeter.",
    variants: ["A milliliter is the same as one cubic centimeter."],
    precisionNotes: "One milliliter is exactly one-thousandth of a liter.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "SI prefixes and decimal units",
        url: "https://www.bipm.org/en/si-prefixes",
        publisher: "BIPM",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the milliliter is">
          <p>
            The milliliter is a practical unit for small liquid amounts such as
            medicine, ingredients, and laboratory samples.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "m3",
    status: "published",
    name: "Cubic meter",
    definition:
      "The cubic meter is the SI derived unit of volume, equal to the volume of a cube one meter on each side.",
    measurementSystem: "SI",
    siClassification: "SI derived unit",
    referenceUnit: "Cubic meter",
    exactRelationship: "1 m³ = 1,000 L exactly",
    formulaNotes: "Multiply cubic meters by 1,000 to convert to liters.",
    commonUses: [
      "Room volume",
      "Construction",
      "Industrial capacity",
    ],
    regions: ["Worldwide"],
    history:
      "The cubic meter is the formal SI unit for volume and follows directly from the meter for three-dimensional space.",
    namingNotes:
      "The symbol is m³ and it is one cubic meter in volume.",
    variants: ["The liter is a practical subunit of the cubic meter used in everyday life."],
    precisionNotes: "One cubic meter is exactly 1,000 liters.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "SI base units and derived units",
        url: "https://www.bipm.org/en/si-base-units",
        publisher: "BIPM",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the cubic meter is">
          <p>
            The cubic meter is the standard SI unit of volume and is used in
            engineering, transport, and large-capacity measurement.
          </p>
        </DefinitionSection>

      </>
    ),
  },
  {
    unitId: "cm3",
    status: "published",
    name: "Cubic centimeter",
    definition:
      "The cubic centimeter is a metric volume unit equal to one milliliter.",
    measurementSystem: "SI",
    siClassification: "Prefixed SI unit",
    referenceUnit: "Cubic meter",
    exactRelationship: "1 cm³ = 1 mL exactly",
    formulaNotes: "Multiply cubic centimeters by 0.001 to convert to liters.",
    commonUses: [
      "Medicine",
      "Lab measurement",
      "Small fluid volumes",
    ],
    regions: ["Worldwide"],
    history:
      "The cubic centimeter is part of the metric system and is often used where milliliters are more natural in practice.",
    namingNotes:
      "The symbol is cm³ and it is equivalent to one milliliter.",
    variants: ["The cubic centimeter and milliliter are exactly equivalent in modern practice."],
    precisionNotes: "One cubic centimeter is exactly one milliliter.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "SI prefixes and decimal units",
        url: "https://www.bipm.org/en/si-prefixes",
        publisher: "BIPM",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the cubic centimeter is">
          <p>
            The cubic centimeter is a very small but common metric volume unit for
            medicine, lab work, and precise fluid quantities.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "dm3",
    status: "published",
    name: "Cubic decimeter",
    definition:
      "The cubic decimeter is a metric volume unit equal to one liter.",
    measurementSystem: "SI",
    siClassification: "Prefixed SI unit",
    referenceUnit: "Cubic meter",
    exactRelationship: "1 dm³ = 1 L exactly",
    formulaNotes: "Multiply cubic decimeters by 0.001 to convert to cubic meters.",
    commonUses: [
      "Education",
      "Metric volume teaching",
      "Laboratory volumes",
    ],
    regions: ["Worldwide"],
    history:
      "The cubic decimeter is a direct metric-volume unit equivalent to the liter and demonstrates the link between cubic dimensions and practical liquid measure.",
    namingNotes:
      "The symbol is dm³ and it is numerically equal to one liter.",
    variants: ["It is less commonly written than the liter in everyday contexts."],
    precisionNotes: "One cubic decimeter is exactly one liter.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "SI prefixes and decimal units",
        url: "https://www.bipm.org/en/si-prefixes",
        publisher: "BIPM",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the cubic decimeter is">
          <p>
            The cubic decimeter is a direct metric unit equivalent to the liter,
            commonly used in science and teaching.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "ft3",
    status: "published",
    name: "Cubic foot",
    definition:
      "The cubic foot is a customary volume unit equal to the volume of a cube one foot on each side.",
    measurementSystem: "Imperial and US customary",
    siClassification: "Non-SI unit",
    referenceUnit: "Cubic meter",
    exactRelationship: "1 ft³ = 0.028316846592 m³ exactly",
    formulaNotes: "Multiply cubic feet by 0.028316846592 to convert to cubic meters.",
    commonUses: [
      "Room volume",
      "Shipping",
      "Construction",
    ],
    regions: ["United States", "United Kingdom"],
    history:
      "The cubic foot is derived from the foot and is widely used in engineering and building contexts.",
    namingNotes:
      "The symbol is ft³ and it is the cube of the foot.",
    variants: ["Cubic feet are common in construction and engineering volume calculations."],
    precisionNotes: "One cubic foot is exactly 0.028316846592 cubic meter.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "NIST Guide to the SI",
        url: "https://www.nist.gov/pml/owm/guide-si",
        publisher: "NIST",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the cubic foot is">
          <p>
            The cubic foot is a widely used volume unit in building and engineering,
            especially in customary systems.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "in3",
    status: "published",
    name: "Cubic inch",
    definition:
      "The cubic inch is a customary volume unit equal to the volume of a cube one inch on each side.",
    measurementSystem: "Imperial and US customary",
    siClassification: "Non-SI unit",
    referenceUnit: "Cubic meter",
    exactRelationship: "1 in³ = 0.000016387064 m³ exactly",
    formulaNotes: "Multiply cubic inches by 0.000016387064 to convert to cubic meters.",
    commonUses: [
      "Mechanical design",
      "Engine displacement",
      "Small technical volumes",
    ],
    regions: ["United States", "United Kingdom"],
    history:
      "The cubic inch is derived from the inch and is often used in engineering and engine specifications.",
    namingNotes:
      "The symbol is in³ and it is the cube of the inch.",
    variants: ["Cubic inches are especially common in engine specifications and mechanical drawings."],
    precisionNotes: "One cubic inch is exactly 0.000016387064 cubic meter.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "NIST Guide to the SI",
        url: "https://www.nist.gov/pml/owm/guide-si",
        publisher: "NIST",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the cubic inch is">
          <p>
            The cubic inch is a compact engineering volume unit often used in
            designs and product specifications.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "gal",
    status: "published",
    name: "US gallon",
    definition:
      "The US gallon is a US customary liquid-volume unit equal to 3.785411784 liters.",
    measurementSystem: "US customary",
    siClassification: "Non-SI unit",
    referenceUnit: "Cubic meter",
    exactRelationship: "1 gal = 3.785411784 L exactly",
    formulaNotes: "Multiply US gallons by 3.785411784 to convert to liters.",
    commonUses: [
      "Fuel economy",
      "Liquid containers",
      "Household liquids",
    ],
    regions: ["United States"],
    history:
      "The gallon is part of the customary volume system used for liquids in the US and is widely used in commerce and transport.",
    namingNotes:
      "The symbol is gal and this is the US gallon, not the imperial gallon.",
    variants: ["The US gallon differs from the imperial gallon used in the UK."],
    precisionNotes: "One US gallon is exactly 3.785411784 liters.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "NIST Guide to the SI",
        url: "https://www.nist.gov/pml/owm/guide-si",
        publisher: "NIST",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the US gallon is">
          <p>
            The US gallon is a standard liquid volume measure in the US, commonly
            used for fuel, water, and household containers.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "qt",
    status: "published",
    name: "US quart",
    definition:
      "The US quart is a customary liquid-volume unit equal to one-fourth of a US gallon.",
    measurementSystem: "US customary",
    siClassification: "Non-SI unit",
    referenceUnit: "Cubic meter",
    exactRelationship: "1 qt = 0.946352946 L exactly",
    formulaNotes: "Multiply US quarts by 0.946352946 to convert to liters.",
    commonUses: [
      "Cooking",
      "Household liquids",
      "Retail container sizes",
    ],
    regions: ["United States"],
    history:
      "The quart is a common US customary measure derived from the gallon and used in recipes and household liquid measurement.",
    namingNotes:
      "The symbol is qt and it is one-fourth of a US gallon.",
    variants: ["The quart is not the same as the imperial quart used elsewhere."],
    precisionNotes: "One US quart is exactly 0.946352946 liters.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "NIST Guide to the SI",
        url: "https://www.nist.gov/pml/owm/guide-si",
        publisher: "NIST",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the US quart is">
          <p>
            The US quart is a practical household and cooking volume unit in the US
            customary system.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "pt",
    status: "published",
    name: "US pint",
    definition:
      "The US pint is a customary liquid-volume unit equal to one-eighth of a US gallon.",
    measurementSystem: "US customary",
    siClassification: "Non-SI unit",
    referenceUnit: "Cubic meter",
    exactRelationship: "1 pt = 0.473176473 L exactly",
    formulaNotes: "Multiply US pints by 0.473176473 to convert to liters.",
    commonUses: [
      "Beverages",
      "Recipes",
      "Container volumes",
    ],
    regions: ["United States"],
    history:
      "The pint has a long history in common trade and household measurement and remains part of the US customary system.",
    namingNotes:
      "The symbol is pt and it is one-eighth of a US gallon.",
    variants: ["The US pint differs from the imperial pint used in the UK."],
    precisionNotes: "One US pint is exactly 0.473176473 liters.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "NIST Guide to the SI",
        url: "https://www.nist.gov/pml/owm/guide-si",
        publisher: "NIST",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the US pint is">
          <p>
            The US pint is still used for beverages and recipes in customary systems,
            especially in the United States.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "tsp",
    status: "published",
    name: "Teaspoon",
    definition:
      "The teaspoon is a small cooking volume unit used in recipes and kitchen measurement.",
    measurementSystem: "US customary",
    siClassification: "Non-SI unit",
    referenceUnit: "Milliliter",
    exactRelationship: "1 tsp = 4.92892159375 mL exactly",
    formulaNotes: "Multiply teaspoons by 4.92892159375 to convert to milliliters.",
    commonUses: [
      "Recipe ingredients",
      "Seasoning",
      "Kitchen measurements",
    ],
    regions: ["United States"],
    history:
      "The teaspoon evolved as a kitchen measure and became standardized in customary cooking systems.",
    namingNotes:
      "The symbol is tsp and the teaspoon is a common recipe unit in the US.",
    variants: ["The teaspoon is distinct from the tablespoon and fluid ounce in cooking measure."],
    precisionNotes: "One US teaspoon is exactly 4.92892159375 milliliters.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "NIST Guide to the SI",
        url: "https://www.nist.gov/pml/owm/guide-si",
        publisher: "NIST",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the teaspoon is">
          <p>
            The teaspoon is a small culinary unit used to measure ingredients and
            flavoring in everyday cooking.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "tbsp",
    status: "published",
    name: "Tablespoon",
    definition:
      "The tablespoon is a cooking volume unit equal to three teaspoons.",
    measurementSystem: "US customary",
    siClassification: "Non-SI unit",
    referenceUnit: "Milliliter",
    exactRelationship: "1 tbsp = 14.78676478125 mL exactly",
    formulaNotes: "Multiply tablespoons by 14.78676478125 to convert to milliliters.",
    commonUses: [
      "Recipes",
      "Sauces",
      "Kitchen measuring",
    ],
    regions: ["United States"],
    history:
      "The tablespoon is a standard kitchen measure in customary cooking systems and is widely used in recipes.",
    namingNotes:
      "The symbol is tbsp and it equals three teaspoons in US cooking measure.",
    variants: ["The tablespoon is larger than the teaspoon and smaller than the cup."],
    precisionNotes: "One US tablespoon is exactly 14.78676478125 milliliters.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "NIST Guide to the SI",
        url: "https://www.nist.gov/pml/owm/guide-si",
        publisher: "NIST",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the tablespoon is">
          <p>
            The tablespoon is a standard cooking measure used to portion ingredients
            and liquids in recipes.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "cup",
    status: "published",
    name: "Cup",
    definition:
      "The cup is a US customary unit of volume used commonly in recipes and kitchen measurement.",
    measurementSystem: "US customary",
    siClassification: "Non-SI unit",
    referenceUnit: "Milliliter",
    exactRelationship: "1 cup = 236.5882365 mL exactly",
    formulaNotes: "Multiply cups by 236.5882365 to convert to milliliters.",
    commonUses: [
      "Recipes",
      "Baking",
      "Household liquids",
    ],
    regions: ["United States"],
    history:
      "The cup is a household kitchen volume unit commonly used in recipes and food preparation.",
    namingNotes:
      "The symbol is cup and the unit is common in US cooking practice.",
    variants: ["The cup is larger than the tablespoon and smaller than the gallon."],
    precisionNotes: "One US cup is exactly 236.5882365 milliliters.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "NIST Guide to the SI",
        url: "https://www.nist.gov/pml/owm/guide-si",
        publisher: "NIST",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the cup is">
          <p>
            The cup is a familiar kitchen measure used for liquids and ingredients
            in everyday recipe work.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "floz",
    status: "published",
    name: "Fluid ounce",
    definition:
      "The US fluid ounce is a customary liquid-volume unit used in recipes and packaging.",
    measurementSystem: "US customary",
    siClassification: "Non-SI unit",
    referenceUnit: "Milliliter",
    exactRelationship: "1 fl oz = 29.5735295625 mL exactly",
    formulaNotes: "Multiply fluid ounces by 29.5735295625 to convert to milliliters.",
    commonUses: [
      "Beverages",
      "Kitchen measures",
      "Labeling and packaging",
    ],
    regions: ["United States"],
    history:
      "The fluid ounce grew from liquid-measure traditions and remains standard in many recipe and product contexts.",
    namingNotes:
      "The symbol is fl oz and it is a volume unit, not a mass unit.",
    variants: ["The fluid ounce should not be confused with the ounce used for mass."],
    precisionNotes: "One US fluid ounce is exactly 29.5735295625 milliliters.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "NIST Guide to the SI",
        url: "https://www.nist.gov/pml/owm/guide-si",
        publisher: "NIST",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the fluid ounce is">
          <p>
            The fluid ounce is used for liquid quantities in everyday cooking and
            packaging, especially in the United States.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "mps",
    status: "published",
    name: "Meter per second",
    definition:
      "The meter per second is the SI unit of speed, describing distance in meters per second.",
    measurementSystem: "SI",
    siClassification: "SI derived unit",
    referenceUnit: "Meter per second",
    exactRelationship: "1 m/s = 1 m ÷ 1 s",
    formulaNotes: "Divide distance in meters by time in seconds to get speed in m/s.",
    commonUses: [
      "Physics",
      "Motion analysis",
      "Engineering speeds",
    ],
    regions: ["Worldwide"],
    history:
      "The meter per second follows naturally from the SI definitions of length and time and is used in physics and engineering.",
    namingNotes:
      "The symbol is m/s and it is the coherent SI unit of speed.",
    variants: ["Kilometers per hour and miles per hour are common practical alternatives in daily use."],
    precisionNotes: "The meter per second is the SI speed unit.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "SI base units and derived units",
        url: "https://www.bipm.org/en/si-base-units",
        publisher: "BIPM",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What meters per second are">
          <p>
            Meters per second is the direct SI measure of speed and is widely used
            in scientific, engineering, and technical calculations.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "kmh",
    status: "published",
    name: "Kilometer per hour",
    definition:
      "The kilometer per hour is a metric speed unit equal to 1,000 meters traveled in one hour.",
    measurementSystem: "SI",
    siClassification: "Non-SI unit",
    referenceUnit: "Meter per second",
    exactRelationship: "1 km/h = 0.2777777778 m/s",
    formulaNotes: "Multiply kilometers per hour by 0.2777777778 to convert to meters per second.",
    commonUses: [
      "Road speed limits",
      "Travel",
      "Traffic and transport",
    ],
    regions: ["Worldwide"],
    history:
      "Kilometers per hour became standard in metric-using countries for road travel and vehicle speeds.",
    namingNotes:
      "The symbol is km/h and it is one of the most common road-speed units in the world.",
    variants: ["Miles per hour is the common alternative in a few countries."],
    precisionNotes: "One kilometer per hour is exactly 0.277777... meters per second.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "SI prefixes and decimal units",
        url: "https://www.bipm.org/en/si-prefixes",
        publisher: "BIPM",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What kilometers per hour are">
          <p>
            Kilometers per hour are the common road-speed unit in most countries and
            are a practical way to express travel speeds using metric distance.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "mph",
    status: "published",
    name: "Miles per hour",
    definition:
      "The mile per hour is a customary speed unit used in the US and a few other countries.",
    measurementSystem: "Imperial and US customary",
    siClassification: "Non-SI unit",
    referenceUnit: "Meter per second",
    exactRelationship: "1 mph = 0.44704 m/s exactly",
    formulaNotes: "Multiply miles per hour by 0.44704 to convert to meters per second.",
    commonUses: [
      "Road speed",
      "Travel",
      "Vehicle performance",
    ],
    regions: ["United States", "United Kingdom"],
    history:
      "Miles per hour grew from the road-distance system used in customary countries and remains common on roads and speedometers.",
    namingNotes:
      "The symbol is mph and it is widely used in road speed reporting.",
    variants: ["Kilometers per hour is the standard alternative in most metric countries."],
    precisionNotes: "One mile per hour is exactly 0.44704 meters per second.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "NIST Guide to the SI",
        url: "https://www.nist.gov/pml/owm/guide-si",
        publisher: "NIST",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What miles per hour are">
          <p>
            Miles per hour are still common on roads and in vehicle display systems
            in countries that use customary distance units.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "knot",
    status: "published",
    name: "Knot",
    definition:
      "The knot is a navigation speed unit equal to one nautical mile per hour.",
    measurementSystem: "Nautical",
    siClassification: "Non-SI unit",
    referenceUnit: "Meter per second",
    exactRelationship: "1 kn = 0.5144444444 m/s exactly",
    formulaNotes: "Multiply knots by 0.5144444444 to convert to meters per second.",
    commonUses: [
      "Maritime navigation",
      "Aviation",
      "Weather and route reporting",
    ],
    regions: ["Worldwide"],
    history:
      "The knot is tied to navigation and the nautical-mile system, making it highly practical for travel over the sea or air.",
    namingNotes:
      "The symbol is kn and it is the standard speed unit for maritime and aviation navigation.",
    variants: ["Knots are not used for ordinary land-speed reporting in most countries."],
    precisionNotes: "One knot is exactly 0.5144444444 meters per second.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "Nautical mile definition",
        url: "https://www.britannica.com/science/nautical-mile",
        publisher: "Encyclopedia Britannica",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the knot is">
          <p>
            The knot is a specialist speed unit designed for travel and navigation,
            especially at sea and in aviation.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "fps",
    status: "published",
    name: "Feet per second",
    definition:
      "The foot per second is a customary speed unit equal to one foot traveled each second.",
    measurementSystem: "Imperial and US customary",
    siClassification: "Non-SI unit",
    referenceUnit: "Meter per second",
    exactRelationship: "1 ft/s = 0.3048 m/s exactly",
    formulaNotes: "Multiply feet per second by 0.3048 to convert to meters per second.",
    commonUses: [
      "Engineering",
      "Physics",
      "Technical motion calculations",
    ],
    regions: ["United States", "United Kingdom"],
    history:
      "Feet per second follow from the foot and are useful in motion and engineering work where a customary length unit is still used.",
    namingNotes:
      "The symbol is ft/s and it is a commonly used engineering speed unit.",
    variants: ["Feet per second is less common for public road speeds than miles per hour."],
    precisionNotes: "One foot per second is exactly 0.3048 meter per second.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "NIST Guide to the SI",
        url: "https://www.nist.gov/pml/owm/guide-si",
        publisher: "NIST",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What feet per second are">
          <p>
            Feet per second is a direct customary speed unit used in engineering and
            motion calculations where the foot remains the length unit.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "pa",
    status: "published",
    name: "Pascal",
    definition:
      "The pascal is the SI unit of pressure, equal to one newton per square meter.",
    measurementSystem: "SI",
    siClassification: "SI derived unit",
    referenceUnit: "Pascal",
    exactRelationship: "1 Pa = 1 N/m²",
    formulaNotes: "Pressure in pascals is force in newtons divided by area in square meters.",
    commonUses: [
      "Physics",
      "Engineering",
      "Fluid and material pressure",
    ],
    regions: ["Worldwide"],
    history:
      "The pascal was named after Blaise Pascal and is the formal SI unit used to describe pressure.",
    namingNotes:
      "The symbol is Pa and it is the standard SI unit of pressure.",
    variants: ["Kilopascals and bars are common practical units for larger pressure values."],
    precisionNotes: "The pascal is the coherent SI unit of pressure.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "SI base units and derived units",
        url: "https://www.bipm.org/en/si-base-units",
        publisher: "BIPM",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the pascal is">
          <p>
            The pascal is the formal SI measure of pressure and is used in physics,
            engineering, and fluid-system analysis.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "kpa",
    status: "published",
    name: "Kilopascal",
    definition:
      "The kilopascal is a metric pressure unit equal to 1,000 pascals.",
    measurementSystem: "SI",
    siClassification: "Prefixed SI unit",
    referenceUnit: "Pascal",
    exactRelationship: "1 kPa = 1,000 Pa exactly",
    formulaNotes: "Multiply kilopascals by 1,000 to convert to pascals.",
    commonUses: [
      "Weather pressure",
      "Engineering",
      "Hydraulics",
    ],
    regions: ["Worldwide"],
    history:
      "The kilopascal is a practical SI multiple used for real-world pressure values larger than a single pascal.",
    namingNotes:
      "The prefix kilo- means one thousand, so a kilopascal is 1,000 pascals.",
    variants: ["Bars and atmospheres are also used in engineering and scientific reporting."],
    precisionNotes: "One kilopascal is exactly 1,000 pascals.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "SI prefixes and decimal units",
        url: "https://www.bipm.org/en/si-prefixes",
        publisher: "BIPM",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the kilopascal is">
          <p>
            The kilopascal is a practical metric pressure unit for real-world values
            such as weather systems and engineering conditions.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "bar",
    status: "published",
    name: "Bar",
    definition:
      "The bar is a pressure unit equal to 100,000 pascals.",
    measurementSystem: "Other",
    siClassification: "Non-SI unit",
    referenceUnit: "Pascal",
    exactRelationship: "1 bar = 100,000 Pa exactly",
    formulaNotes: "Multiply bars by 100,000 to convert to pascals.",
    commonUses: [
      "Industrial pressure",
      "Hydraulics",
      "Materials and processes",
    ],
    regions: ["Worldwide"],
    history:
      "The bar is a practical pressure unit used widely in engineering, especially where gas and fluid systems are measured.",
    namingNotes:
      "The symbol is bar and it is a widely used engineering unit even though it is not a base SI unit.",
    variants: ["Bars and kilopascals are often used interchangeably in industrial practice."],
    precisionNotes: "One bar is exactly 100,000 pascals.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "SI base units and derived units",
        url: "https://www.bipm.org/en/si-base-units",
        publisher: "BIPM",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the bar is">
          <p>
            The bar is a widely used engineering pressure unit, especially in
            industrial settings and fluid systems.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "atm",
    status: "published",
    name: "Atmosphere",
    definition:
      "The atmosphere is a pressure unit equal to 101,325 pascals and based on standard atmospheric pressure.",
    measurementSystem: "Other",
    siClassification: "Non-SI unit",
    referenceUnit: "Pascal",
    exactRelationship: "1 atm = 101,325 Pa exactly",
    formulaNotes: "Multiply atmospheres by 101,325 to convert to pascals.",
    commonUses: [
      "Chemistry",
      "Gas laws",
      "Atmospheric science",
    ],
    regions: ["Worldwide"],
    history:
      "The atmosphere is a practical pressure unit based on Earth’s average sea-level pressure and is widely used in science and chemistry.",
    namingNotes:
      "The symbol is atm and it is shorthand for standard atmospheric pressure.",
    variants: ["Atmospheres are often used in chemistry and physics even though SI uses pascals."],
    precisionNotes: "One atmosphere is exactly 101,325 pascals.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
      {
        title: "SI base units and derived units",
        url: "https://www.bipm.org/en/si-base-units",
        publisher: "BIPM",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the atmosphere is">
          <p>
            The atmosphere is a practical reference pressure used in chemistry,
            meteorology, and scientific calculations.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "psi",
    status: "published",
    name: "Pounds per square inch",
    definition:
      "The pound per square inch is a pressure unit used commonly in engineering and in US customary systems.",
    measurementSystem: "Imperial and US customary",
    siClassification: "Non-SI unit",
    referenceUnit: "Pascal",
    exactRelationship: "1 psi = 6,894.757293168 Pa exactly",
    formulaNotes: "Multiply psi by 6,894.757293168 to convert to pascals.",
    commonUses: [
      "Tire pressure",
      "Hydraulic systems",
      "Mechanical engineering",
    ],
    regions: ["United States"],
    history:
      "PSI developed from customary engineering practice and is widely used where imperial units remain common.",
    namingNotes:
      "The symbol is psi and it means pounds per square inch.",
    variants: ["PSI is common in US engineering work but less common in SI-dominant contexts."],
    precisionNotes: "One psi is exactly 6,894.757293168 pascals.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "NIST Guide to the SI",
        url: "https://www.nist.gov/pml/owm/guide-si",
        publisher: "NIST",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What psi is">
          <p>
            PSI is a common engineering pressure unit in the US, especially for tire
            pressure and hydraulic systems.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "mmhg",
    status: "published",
    name: "Millimeter of mercury",
    definition:
      "The millimeter of mercury is a pressure unit based on the height of a mercury column and commonly used in medicine and meteorology.",
    measurementSystem: "Other",
    siClassification: "Non-SI unit",
    referenceUnit: "Pascal",
    exactRelationship: "1 mmHg = 133.322387415 Pa exactly",
    formulaNotes: "Multiply mmHg by 133.322387415 to convert to pascals.",
    commonUses: [
      "Blood pressure",
      "Meteorology",
      "Medical diagnostics",
    ],
    regions: ["Worldwide"],
    history:
      "Millimeters of mercury are historically tied to barometers and medical instruments using mercury columns.",
    namingNotes:
      "The symbol is mmHg and it remains common in medical literature.",
    variants: ["mmHg remains common in medicine even though pascals are the SI unit of pressure."],
    precisionNotes: "One millimeter of mercury is exactly 133.322387415 pascals.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
      {
        title: "SI base units and derived units",
        url: "https://www.bipm.org/en/si-base-units",
        publisher: "BIPM",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What mmHg is">
          <p>
            mmHg is a traditional pressure unit still used in medicine and some
            atmospheric measurements, even though SI favors the pascal.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "j",
    status: "published",
    name: "Joule",
    definition:
      "The joule is the SI unit of energy, equal to one newton-meter.",
    measurementSystem: "SI",
    siClassification: "SI derived unit",
    referenceUnit: "Joule",
    exactRelationship: "1 J = 1 N·m",
    formulaNotes: "Energy in joules is force in newtons multiplied by distance in meters.",
    commonUses: [
      "Science",
      "Engineering",
      "Energy and heat",
    ],
    regions: ["Worldwide"],
    history:
      "The joule is named after James Prescott Joule and is the standard SI energy measure.",
    namingNotes:
      "The symbol is J and it is the standard unit for energy in SI.",
    variants: ["Kilojoules and watt-hours are common larger practical units."],
    precisionNotes: "The joule is the coherent SI unit of energy.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "SI base units and derived units",
        url: "https://www.bipm.org/en/si-base-units",
        publisher: "BIPM",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the joule is">
          <p>
            The joule is the basic SI unit for energy and is used across physics,
            engineering, and daily technical calculations.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "kj",
    status: "published",
    name: "Kilojoule",
    definition:
      "The kilojoule is a metric energy unit equal to 1,000 joules.",
    measurementSystem: "SI",
    siClassification: "Prefixed SI unit",
    referenceUnit: "Joule",
    exactRelationship: "1 kJ = 1,000 J exactly",
    formulaNotes: "Multiply kilojoules by 1,000 to convert to joules.",
    commonUses: [
      "Food energy",
      "Engineering",
      "Industrial energy",
    ],
    regions: ["Worldwide"],
    history:
      "The kilojoule is used because practical energy values are often larger than a single joule.",
    namingNotes:
      "The symbol is kJ and the prefix kilo- means one thousand.",
    variants: ["Food energy is often also reported in kilocalories."],
    precisionNotes: "One kilojoule is exactly 1,000 joules.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "SI prefixes and decimal units",
        url: "https://www.bipm.org/en/si-prefixes",
        publisher: "BIPM",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the kilojoule is">
          <p>
            The kilojoule is a practical SI energy unit for larger values in
            engineering and food-energy contexts.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "cal",
    status: "published",
    name: "Calorie",
    definition:
      "The calorie is a historical energy unit equal to 4.184 joules.",
    measurementSystem: "Other",
    siClassification: "Non-SI unit",
    referenceUnit: "Joule",
    exactRelationship: "1 cal = 4.184 J exactly",
    formulaNotes: "Multiply calories by 4.184 to convert to joules.",
    commonUses: [
      "Chemistry",
      "Food energy",
      "History and education",
    ],
    regions: ["Worldwide"],
    history:
      "The calorie has a long historical role in thermodynamics and food science before the dominance of SI units.",
    namingNotes:
      "The symbol is cal and it is often confused with the kilocalorie in food contexts.",
    variants: ["The kilocalorie is more common than the calorie in nutrition labeling."],
    precisionNotes: "The calorie is exactly 4.184 joules.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
      {
        title: "SI base units and derived units",
        url: "https://www.bipm.org/en/si-base-units",
        publisher: "BIPM",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the calorie is">
          <p>
            The calorie is a traditional energy unit still familiar in chemistry and
            food contexts, though the joule is the standard SI unit.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "kcal",
    status: "published",
    name: "Kilocalorie",
    definition:
      "The kilocalorie is an energy unit equal to 1,000 calories and 4,184 joules.",
    measurementSystem: "Other",
    siClassification: "Non-SI unit",
    referenceUnit: "Joule",
    exactRelationship: "1 kcal = 4,184 J exactly",
    formulaNotes: "Multiply kilocalories by 4,184 to convert to joules.",
    commonUses: [
      "Nutrition labels",
      "Dietary guidance",
      "Food energy",
    ],
    regions: ["Worldwide"],
    history:
      "The kilocalorie became prominent in food labeling because everyday food energy values are larger than a single calorie.",
    namingNotes:
      "In food contexts, kilocalories are often colloquially called calories.",
    variants: ["Food labels may say calories even when the scientific unit is the kilocalorie."],
    precisionNotes: "One kilocalorie is exactly 4,184 joules.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
      {
        title: "SI base units and derived units",
        url: "https://www.bipm.org/en/si-base-units",
        publisher: "BIPM",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the kilocalorie is">
          <p>
            The kilocalorie is widely used in food energy contexts and remains a
            familiar unit even though the joule is the modern SI standard.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "wh",
    status: "published",
    name: "Watt-hour",
    definition:
      "The watt-hour is an electrical energy unit equal to one watt for one hour.",
    measurementSystem: "SI",
    siClassification: "Non-SI unit",
    referenceUnit: "Joule",
    exactRelationship: "1 Wh = 3,600 J exactly",
    formulaNotes: "Multiply watt-hours by 3,600 to convert to joules.",
    commonUses: [
      "Battery capacity",
      "Household energy",
      "Electrical systems",
    ],
    regions: ["Worldwide"],
    history:
      "The watt-hour is a practical energy unit for electricity generation and storage.",
    namingNotes:
      "The symbol is Wh and it is used in electrical and battery contexts.",
    variants: ["Kilowatt-hours are commonly used for larger household power usage."],
    precisionNotes: "One watt-hour is exactly 3,600 joules.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "SI base units and derived units",
        url: "https://www.bipm.org/en/si-base-units",
        publisher: "BIPM",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the watt-hour is">
          <p>
            The watt-hour is widely used for batteries and electricity usage because
            it expresses energy in a practical, everyday scale.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "kwh",
    status: "published",
    name: "Kilowatt-hour",
    definition:
      "The kilowatt-hour is a larger electrical energy unit equal to 1,000 watt-hours.",
    measurementSystem: "SI",
    siClassification: "Non-SI unit",
    referenceUnit: "Joule",
    exactRelationship: "1 kWh = 3,600,000 J exactly",
    formulaNotes: "Multiply kilowatt-hours by 3,600,000 to convert to joules.",
    commonUses: [
      "Electricity bills",
      "Home energy reporting",
      "Battery and grid capacity",
    ],
    regions: ["Worldwide"],
    history:
      "The kilowatt-hour is a practical unit for utility energy billing and electricity consumption.",
    namingNotes:
      "The symbol is kWh and it remains common in energy billing and power systems.",
    variants: ["Watt-hours are used for smaller energy quantities."],
    precisionNotes: "One kilowatt-hour is exactly 3,600,000 joules.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "SI base units and derived units",
        url: "https://www.bipm.org/en/si-base-units",
        publisher: "BIPM",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the kilowatt-hour is">
          <p>
            The kilowatt-hour is the everyday unit for household electricity use and
            energy supply reporting.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "w",
    status: "published",
    name: "Watt",
    definition:
      "The watt is the SI unit of power, equal to one joule per second.",
    measurementSystem: "SI",
    siClassification: "SI derived unit",
    referenceUnit: "Watt",
    exactRelationship: "1 W = 1 J/s",
    formulaNotes: "Power in watts is energy in joules divided by time in seconds.",
    commonUses: [
      "Electronics",
      "Lighting",
      "Power ratings",
    ],
    regions: ["Worldwide"],
    history:
      "The watt was named after James Watt and became the standard power unit in SI.",
    namingNotes:
      "The symbol is W and it is the standard SI power unit.",
    variants: ["Kilowatts and horsepower are common practical alternatives for larger power values."],
    precisionNotes: "The watt is the coherent SI unit of power.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "SI base units and derived units",
        url: "https://www.bipm.org/en/si-base-units",
        publisher: "BIPM",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the watt is">
          <p>
            The watt is the standard SI unit for power and is used for devices,
            equipment, and electrical systems.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "kw",
    status: "published",
    name: "Kilowatt",
    definition:
      "The kilowatt is a metric power unit equal to 1,000 watts.",
    measurementSystem: "SI",
    siClassification: "Prefixed SI unit",
    referenceUnit: "Watt",
    exactRelationship: "1 kW = 1,000 W exactly",
    formulaNotes: "Multiply kilowatts by 1,000 to convert to watts.",
    commonUses: [
      "Appliance power",
      "Industrial loads",
      "Electrical systems",
    ],
    regions: ["Worldwide"],
    history:
      "The kilowatt is a practical SI multiple used when ordinary power values are larger than one watt.",
    namingNotes:
      "The symbol is kW and the prefix kilo- means one thousand.",
    variants: ["Horsepower is a common alternative in some mechanical contexts."],
    precisionNotes: "One kilowatt is exactly 1,000 watts.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "SI prefixes and decimal units",
        url: "https://www.bipm.org/en/si-prefixes",
        publisher: "BIPM",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What the kilowatt is">
          <p>
            The kilowatt is a practical power unit for homes, machinery, and power
            systems when power values are larger than a single watt.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "hp",
    status: "published",
    name: "Horsepower",
    definition:
      "Horsepower is a power unit based on the historical output of a horse and equal to 745.6998715822702 watts.",
    measurementSystem: "Other",
    siClassification: "Non-SI unit",
    referenceUnit: "Watt",
    exactRelationship: "1 hp = 745.6998715822702 W exactly",
    formulaNotes: "Multiply horsepower by 745.6998715822702 to convert to watts.",
    commonUses: [
      "Vehicle power",
      "Engine ratings",
      "Mechanical engineering",
    ],
    regions: ["United States"],
    history:
      "Horsepower was introduced in the 18th century to explain steam-engine output and remains familiar for engine performance.",
    namingNotes:
      "The symbol is hp and it is a traditional unit for mechanical power.",
    variants: ["Metric horsepower is a different unit used in some regions."],
    precisionNotes: "Mechanical horsepower is exactly 745.6998715822702 watts.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "NIST Guide to the SI",
        url: "https://www.nist.gov/pml/owm/guide-si",
        publisher: "NIST",
      },
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What horsepower is">
          <p>
            Horsepower remains common in engine and machinery ratings, even though
            the SI unit for power is the watt.
          </p>
        </DefinitionSection>
      </>
    ),
  },
  {
    unitId: "ps",
    status: "published",
    name: "Metric horsepower",
    definition:
      "Metric horsepower is a power unit used in some engineering traditions and equal to 735.49875 watts.",
    measurementSystem: "Other",
    siClassification: "Non-SI unit",
    referenceUnit: "Watt",
    exactRelationship: "1 PS = 735.49875 W exactly",
    formulaNotes: "Multiply metric horsepower by 735.49875 to convert to watts.",
    commonUses: [
      "Engine ratings",
      "European engineering",
      "Power comparisons",
    ],
    regions: ["Europe"],
    history:
      "Metric horsepower was developed as a practical alternative to mechanical horsepower in parts of Europe.",
    namingNotes:
      "The symbol is PS and it is common in engine specifications in some regions.",
    variants: ["Metric horsepower differs from imperial horsepower and should not be confused with it."],
    precisionNotes: "Metric horsepower is exactly 735.49875 watts.",
    reviewedAt: "2026-09-04",
    sources: [
      {
        title: "The International System of Units (SI), 2019 Edition",
        url: "https://doi.org/10.6028/NIST.SP.330-2019",
        publisher: "NIST",
      },
      {
        title: "NIST Guide to the SI",
        url: "https://www.nist.gov/pml/owm/guide-si",
        publisher: "NIST",
      },
    ],
    content: (
      <>
        <DefinitionSection title="What metric horsepower is">
          <p>
            Metric horsepower is a regional engineering unit used for machine and
            engine power ratings in some European traditions.
          </p>
        </DefinitionSection>
      </>
    ),
  },
];

function validateContent() {
  const knownIds = new Set(UNITS.map(({ id }) => id));
  const contentIds = new Set<string>();

  for (const content of DEFINITION_CONTENT) {
    const { unitId } = content;
    if (!knownIds.has(unitId)) {
      throw new Error(`Definition content references unknown unit: ${unitId}`);
    }
    if (contentIds.has(unitId)) {
      throw new Error(`Duplicate definition content for unit: ${unitId}`);
    }
    contentIds.add(unitId);

    if (content.reviewedAt && Number.isNaN(Date.parse(content.reviewedAt))) {
      throw new Error(`Invalid reviewedAt date for definition: ${unitId}`);
    }

    if (content.status === "published") {
      const missingFields = [
        ["name", content.name],
        ["definition", content.definition],
        ["measurementSystem", content.measurementSystem],
        ["siClassification", content.siClassification],
        ["reviewedAt", content.reviewedAt],
        ["sources", content.sources?.length],
      ]
        .filter(([, value]) => !value)
        .map(([field]) => field);

      if (missingFields.length > 0) {
        throw new Error(
          `Published definition "${unitId}" is missing: ${missingFields.join(", ")}`,
        );
      }
    }
  }
}

validateContent();

const CONTENT_BY_ID = new Map(
  DEFINITION_CONTENT.map(({ unitId, ...content }) => [unitId, content]),
);

const SOURCE_OVERRIDES: Record<string, DefinitionSource[]> = {
  m: [
    {
      title: "SI base unit: metre (m)",
      url: "https://www.bipm.org/en/si-base-units/metre",
      publisher: "BIPM",
    },
    {
      title: "SI Units: Length",
      url: "https://www.nist.gov/pml/owm/si-units-length",
      publisher: "NIST",
    },
  ],
  kg: [
    {
      title: "SI base unit: kilogram (kg)",
      url: "https://www.bipm.org/en/si-base-units/kilogram",
      publisher: "BIPM",
    },
    {
      title: "SI Units: Mass",
      url: "https://www.nist.gov/pml/owm/si-units-mass",
      publisher: "NIST",
    },
  ],
  celsius: [
    {
      title: "SI Units: Temperature",
      url: "https://www.nist.gov/pml/owm/si-units-temperature",
      publisher: "NIST",
    },
    {
      title: "SI base unit: kelvin (K)",
      url: "https://www.bipm.org/en/si-base-units/kelvin",
      publisher: "BIPM",
    },
  ],
};

const LENGTH_SOURCES: DefinitionSource[] = [
  {
    title: "SI Units: Length",
    url: "https://www.nist.gov/pml/owm/si-units-length",
    publisher: "NIST",
  },
  {
    title: "NIST Guide to the SI",
    url: "https://www.nist.gov/pml/owm/guide-si",
    publisher: "NIST",
  },
];

const MASS_SOURCES: DefinitionSource[] = [
  {
    title: "SI Units: Mass",
    url: "https://www.nist.gov/pml/owm/si-units-mass",
    publisher: "NIST",
  },
  {
    title: "NIST Guide to the SI",
    url: "https://www.nist.gov/pml/owm/guide-si",
    publisher: "NIST",
  },
];

const VOLUME_SOURCES: DefinitionSource[] = [
  {
    title: "SI Units: Volume",
    url: "https://www.nist.gov/pml/owm/si-units-volume",
    publisher: "NIST",
  },
  {
    title: "NIST Guide to the SI",
    url: "https://www.nist.gov/pml/owm/guide-si",
    publisher: "NIST",
  },
];

const AREA_SOURCES: DefinitionSource[] = [
  {
    title: "Circumference, Area and Volume",
    url: "https://www.nist.gov/pml/owm/circumference-area-and-volume",
    publisher: "NIST",
  },
  {
    title: "NIST Guide to the SI",
    url: "https://www.nist.gov/pml/owm/guide-si",
    publisher: "NIST",
  },
];

const SI_SOURCES_FOR_DERIVED_UNITS: DefinitionSource[] = [
  {
    title: "The International System of Units (SI), 2019 Edition",
    url: "https://doi.org/10.6028/NIST.SP.330-2019",
    publisher: "NIST",
  },
  {
    title: "SI base units and derived units",
    url: "https://www.bipm.org/en/si-brochure",
    publisher: "BIPM",
  },
];

const CATEGORY_SOURCES: Partial<Record<Unit["category"], DefinitionSource[]>> =
  {
    length: LENGTH_SOURCES,
    mass: MASS_SOURCES,
    area: AREA_SOURCES,
    volume: VOLUME_SOURCES,
    cooking: VOLUME_SOURCES,
    temperature: [
      {
        title: "SI Units: Temperature",
        url: "https://www.nist.gov/pml/owm/si-units-temperature",
        publisher: "NIST",
      },
      {
        title: "SI base unit: kelvin (K)",
        url: "https://www.bipm.org/en/si-base-units/kelvin",
        publisher: "BIPM",
      },
    ],
    speed: SI_SOURCES_FOR_DERIVED_UNITS,
    pressure: SI_SOURCES_FOR_DERIVED_UNITS,
    energy: SI_SOURCES_FOR_DERIVED_UNITS,
    power: SI_SOURCES_FOR_DERIVED_UNITS,
  };

const DEFINITIONS: UnitDefinition[] = UNITS.map((unit) => ({
  unit,
  quantity: CATEGORY_LABELS[unit.category],
  status: "draft",
  ...CONTENT_BY_ID.get(unit.id),
  sources:
    SOURCE_OVERRIDES[unit.id] ??
    CATEGORY_SOURCES[unit.category] ??
    CONTENT_BY_ID.get(unit.id)?.sources,
}));

const DEFINITION_BY_ID = new Map(
  DEFINITIONS.map((definition) => [definition.unit.id, definition]),
);

export function getAllDefinitions(): readonly UnitDefinition[] {
  return DEFINITIONS;
}

export function getDefinition(unitId: string): UnitDefinition | undefined {
  return DEFINITION_BY_ID.get(unitId);
}

export function getPublishedDefinitions(): UnitDefinition[] {
  return DEFINITIONS.filter(({ status }) => status === "published");
}

export function getPublishedDefinition(
  unitId: string,
): UnitDefinition | undefined {
  const definition = getDefinition(unitId);
  return definition?.status === "published" ? definition : undefined;
}
