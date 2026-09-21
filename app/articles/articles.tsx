import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArticleCallout,
  ArticleFAQ,
  ArticleSection,
  ArticleSubsection,
  ConverterLink,
  type ArticleFaqItem,
} from "../components/articles/ArticleContent";
import {
  DefinitionTable,
  DefinitionTableCell,
  DefinitionTableHeadCell,
  DefinitionTableRow,
} from "../components/definitions/DefinitionTable";
import { parseSlug } from "../lib/units";

export type ArticleStatus = "draft" | "published";

export type ArticleCategory =
  | "time"
  | "temperature"
  | "measurement-systems"
  | "cooking"
  | "mass-weight"
  | "area"
  | "power"
  | "energy"
  | "pressure"
  | "speed"
  | "general";

export const ARTICLE_CATEGORY_LABELS: Record<ArticleCategory, string> = {
  time: "Time & time zones",
  temperature: "Temperature",
  "measurement-systems": "Measurement systems",
  cooking: "Cooking & baking",
  "mass-weight": "Mass & weight",
  area: "Area & land",
  power: "Power",
  energy: "Energy",
  pressure: "Pressure",
  speed: "Speed",
  general: "General",
};

export type ArticleHowTo = {
  name: string;
  steps: { name: string; text: string }[];
};

export type ArticleDefinition = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  status: ArticleStatus;
  category: ArticleCategory;
  relatedRoutes: `/${string}`[];
  /** Slugs of other articles to cross-link from a "Related guides" module. */
  relatedArticleSlugs?: string[];
  faq?: ArticleFaqItem[];
  howTo?: ArticleHowTo;
  content: ReactNode;
};

const HOW_TIME_ZONES_WORK_FAQ: ArticleFaqItem[] = [
  {
    question: "What is UTC?",
    answer:
      "UTC (Coordinated Universal Time) is the global time reference that replaced Greenwich Mean Time as the basis for civil timekeeping. Every time zone is defined as a fixed offset from UTC, such as UTC-5 or UTC+9, and that offset changes by one hour in zones that observe daylight saving time.",
  },
  {
    question: "Why do time zones follow borders instead of straight lines?",
    answer:
      "A purely geographic system would divide the world into 24 straight bands of longitude 15 degrees wide. In practice, governments adjust the boundaries to follow country and state borders for economic and administrative convenience, which is why time zone maps zigzag instead of forming straight vertical lines.",
  },
  {
    question: "Does every country observe daylight saving time?",
    answer:
      "No. Most of Europe and North America observe daylight saving time, but most countries in Africa and Asia do not. Even among countries that do observe it, the start and end dates vary, and some regions within a country, such as Arizona in the US, opt out entirely.",
  },
  {
    question:
      "Why does the time difference between two cities change during the year?",
    answer:
      "When two places are in different daylight saving time schedules, the number of hours between them can shift for a few weeks each year. For example, New York and London are usually 5 hours apart, but only 4 hours apart for a few weeks in spring because the US starts daylight saving time before the UK does.",
  },
  {
    question: "Who decided how time zones are divided?",
    answer:
      "The framework for modern time zones traces back to the 1884 International Meridian Conference in Washington, D.C., where 25 nations agreed to use the Greenwich meridian as the 0-degree reference line. Individual countries and regions have since adjusted their zone boundaries and daylight saving time rules for political and economic reasons.",
  },
];

const CELSIUS_FAHRENHEIT_FAQ: ArticleFaqItem[] = [
  {
    question: "What is the formula to convert Celsius to Fahrenheit?",
    answer:
      "Multiply the Celsius temperature by 9/5 (1.8) and add 32: °F = (°C × 9/5) + 32. To go the other way, subtract 32 and multiply by 5/9: °C = (°F − 32) × 5/9.",
  },
  {
    question: "Why does water freeze at 32°F instead of 0°F?",
    answer:
      "Daniel Fahrenheit built his scale around a laboratory brine mixture (0°F) and, separately, human body temperature (originally set near 96°F). Water's freezing and boiling points landed at 32°F and 212°F almost incidentally, rather than being chosen as round numbers the way Celsius chose 0 and 100.",
  },
  {
    question: "Is there a temperature where Celsius and Fahrenheit are equal?",
    answer:
      "Yes: −40°C and −40°F are the same temperature, which is the point where the two linear scales cross.",
  },
  {
    question: "Which countries still use Fahrenheit?",
    answer:
      "The United States is the main country that uses Fahrenheit for everyday temperatures, along with a handful of territories such as the Bahamas, Belize, and the Cayman Islands. Nearly every other country uses Celsius.",
  },
];

const METRIC_IMPERIAL_FAQ: ArticleFaqItem[] = [
  {
    question: "Which countries still use the imperial system?",
    answer:
      "The United States is the most prominent example, using miles, pounds, and Fahrenheit in everyday life. Liberia and Myanmar are also frequently cited as non-metric, though both have officially adopted metric units to varying degrees. The United Kingdom uses a mix, with miles on road signs but metric units in most other contexts.",
  },
  {
    question: "Has the US ever tried to switch to the metric system?",
    answer:
      "Yes. The Metric Conversion Act of 1975 declared metric the preferred system and encouraged voluntary conversion, but it set no deadlines or mandates, and the effort largely stalled. Metric units are already standard in US science, medicine, the military, and manufacturing for export.",
  },
  {
    question: "What are the base units of the metric system?",
    answer:
      "The International System of Units (SI) defines seven base units: the metre (length), kilogram (mass), second (time), ampere (electric current), kelvin (temperature), mole (amount of substance), and candela (luminous intensity). Every other metric unit is derived from these.",
  },
  {
    question: "Is the imperial system less accurate than the metric system?",
    answer:
      "No — both systems can express the same physical quantity to any level of precision. The practical difference is that metric units scale by powers of ten (making conversions and calculations simpler), while imperial units use irregular ratios such as 12 inches per foot and 16 ounces per pound.",
  },
];

const BAKING_CONVERSIONS_FAQ: ArticleFaqItem[] = [
  {
    question: "How many grams are in a cup?",
    answer:
      "It depends entirely on the ingredient, because a cup measures volume and grams measure weight. A US cup of all-purpose flour is roughly 120–125 g, a cup of granulated sugar is roughly 200 g, and a cup of water is almost exactly 240 g, since water's density is close to 1 g/mL.",
  },
  {
    question: "How many tablespoons are in a cup?",
    answer:
      "There are 16 tablespoons in one US cup, and 3 teaspoons in one tablespoon.",
  },
  {
    question: "Is a US cup the same size as a metric cup?",
    answer:
      "No. A US cup is 240 mL, while the metric cup used in Australia, New Zealand, and the UK is 250 mL — close enough for casual cooking, but enough of a difference to matter in precise baking.",
  },
  {
    question: "Why do professional bakers weigh ingredients instead of using cups?",
    answer:
      "Volume measurements like cups are sensitive to how an ingredient is packed or scooped, so the same recipe can yield different results depending on technique. Weighing ingredients on a scale removes that variability, which is why weight-based measurements are standard in professional and metric baking.",
  },
];

const MASS_WEIGHT_FAQ: ArticleFaqItem[] = [
  {
    question: "Is mass the same thing as weight?",
    answer:
      "No. Mass is the amount of matter in an object and doesn't change based on location. Weight is the force of gravity acting on that mass, so it does change — an object weighs less on the Moon than on Earth even though its mass is identical.",
  },
  {
    question: "How many pounds are in a kilogram?",
    answer: "One kilogram is approximately 2.20462 pounds.",
  },
  {
    question: "How many ounces are in a pound?",
    answer:
      "There are 16 avoirdupois ounces in one pound — the system used for everyday goods like food and body weight. A separate troy ounce, used for precious metals, is slightly heavier and doesn't follow the same 16-to-a-pound relationship.",
  },
  {
    question: "Why do kilograms and pounds both work as everyday weight units?",
    answer:
      "On Earth's surface, gravity is close enough to constant that mass and weight are proportional, so kilograms and pounds can be used interchangeably in daily life even though, technically, the kilogram measures mass and the pound-force measures weight.",
  },
];

const LAND_AREA_FAQ: ArticleFaqItem[] = [
  {
    question: "How many square meters are in an acre?",
    answer: "One acre is approximately 4,047 square meters, or about 0.405 hectares.",
  },
  {
    question: "What is a hectare used for?",
    answer:
      "A hectare (10,000 square meters, or 100 m × 100 m) is the standard metric unit for measuring land area, commonly used for farms, forests, parks, and urban planning in most countries outside the US.",
  },
  {
    question: "Where did the acre come from?",
    answer:
      "The acre originated in medieval England as the area a yoke of oxen could plow in a single day — roughly one furlong (660 feet) long by one chain (66 feet) wide. That practical definition is why the acre has an unusual size compared to modern square units.",
  },
  {
    question: "How big is a football field in acres?",
    answer:
      "A standard American football field, including the end zones, covers about 1.32 acres (roughly 0.53 hectares).",
  },
];

const HORSEPOWER_KW_FAQ: ArticleFaqItem[] = [
  {
    question: "How many kilowatts is 100 horsepower?",
    answer:
      "100 mechanical horsepower is approximately 74.6 kilowatts, using the standard conversion of 1 hp ≈ 0.746 kW.",
  },
  {
    question: "Why do European car specifications list power in kW?",
    answer:
      "The European Union uses the metric system for official vehicle specifications, so power output is measured in kilowatts. Many European manufacturers list both kW and hp (or PS, the metric horsepower variant) since horsepower remains familiar to consumers.",
  },
  {
    question: "Is horsepower a unit of energy or power?",
    answer:
      "Power. Horsepower measures the rate at which work is done (like watts), not the total amount of energy. It was originally defined by James Watt to compare the output of steam engines against the working rate of a horse.",
  },
  {
    question: "Are all 'horsepower' units the same?",
    answer:
      "No. Mechanical horsepower (hp), metric horsepower (PS or CV), and electrical horsepower differ slightly — metric horsepower is about 1.4% smaller than mechanical horsepower — so converted figures can vary slightly depending on which definition a manufacturer uses.",
  },
];

const CALORIES_JOULES_FAQ: ArticleFaqItem[] = [
  {
    question: "Is a food Calorie the same as a calorie in physics?",
    answer:
      "No, and the capitalization matters. A food \"Calorie\" (kcal) is equal to 1,000 physics calories (cal). Nutrition labels use the food Calorie, which is why a 200-Calorie snack is actually 200,000 physics calories of energy.",
  },
  {
    question: "How many joules are in a calorie?",
    answer:
      "One (small) calorie equals approximately 4.184 joules. One food Calorie (kilocalorie) equals approximately 4,184 joules, or about 4.18 kJ.",
  },
  {
    question: "Why do nutrition labels use kilocalories instead of joules?",
    answer:
      "Historical convention: calorie-based food labeling began in the late 1800s and became entrenched in US and UK nutrition science before the joule was widely adopted as the SI unit of energy. Many countries, including EU member states, now list both kJ and kcal on packaging.",
  },
  {
    question: "Who was the joule named after?",
    answer:
      "The joule is named after James Prescott Joule, a 19th-century English physicist whose experiments established the relationship between heat, work, and mechanical energy.",
  },
];

const PRESSURE_UNITS_FAQ: ArticleFaqItem[] = [
  {
    question: "How many PSI are in a bar?",
    answer: "One bar is approximately 14.5 PSI (pounds per square inch).",
  },
  {
    question: "What is a pascal, in simple terms?",
    answer:
      "A pascal is the SI unit of pressure, defined as one newton of force applied over one square meter. It's a very small unit for everyday pressures, which is why weather reports use kilopascals (kPa) and engineering contexts often use megapascals (MPa).",
  },
  {
    question: "What PSI should my tires be?",
    answer:
      "It depends on the vehicle and tire — check the manufacturer's recommended PSI, usually printed on a sticker inside the driver's door or in the owner's manual, rather than the maximum PSI printed on the tire's sidewall.",
  },
  {
    question: "Why do some countries use bar and others use PSI for pressure?",
    answer:
      "Bar is common in Europe and much of the world because it's close to standard atmospheric pressure (1 bar ≈ 0.987 atm) and fits naturally into the metric system. PSI remains standard in the US because it's the imperial-derived unit historically used for tires, tools, and industrial equipment.",
  },
];

const SPEED_UNITS_FAQ: ArticleFaqItem[] = [
  {
    question: "Why do ships and planes use knots instead of mph?",
    answer:
      "A knot is one nautical mile per hour, and a nautical mile is defined so that one minute of latitude equals one nautical mile — a relationship that ties speed directly to position on a navigational chart. That made knots far more convenient for navigation than statute miles, and the convention has persisted in maritime and aviation use ever since.",
  },
  {
    question: "How many mph is one knot?",
    answer: "One knot is approximately 1.15 mph (or about 1.852 km/h).",
  },
  {
    question: "Why does the UK use mph on road signs but km/h elsewhere?",
    answer:
      "The UK partially metricated in the late 20th century but kept miles and mph for road distances and speed limits due to the cost and disruption of replacing road signage, even though it uses metric units in most other contexts. Most of the rest of the world, including the rest of Europe, uses km/h for road speeds.",
  },
  {
    question: "What is the difference between a nautical mile and a statute mile?",
    answer:
      "A nautical mile (about 1.852 km) is longer than a statute (land) mile (about 1.609 km). The nautical mile is based on the Earth's circumference, while the statute mile has its roots in old Roman and English land-measurement units.",
  },
];

const METRIC_HISTORY_FAQ: ArticleFaqItem[] = [
  {
    question: "Who created the metric system?",
    answer:
      "The metric system was developed by French scientists during the French Revolution in the 1790s, commissioned by the French Academy of Sciences to create a rational, decimal-based system of measurement to replace the patchwork of local units used across France.",
  },
  {
    question: "What is a meter defined as today?",
    answer:
      "Since 1983, the meter has been defined as the distance light travels in a vacuum in 1/299,792,458 of a second — a physical constant, rather than a physical artifact like the original platinum bar kept in France.",
  },
  {
    question: "Which countries don't use the metric system?",
    answer:
      "The United States is the largest economy that has not fully adopted the metric system for everyday use, though it is used in science, medicine, and much of manufacturing. Most other countries have adopted metric units as their official system, even where some imperial units persist in casual use, such as pints in UK pubs.",
  },
  {
    question: "Why was a decimal-based system considered an improvement?",
    answer:
      "Before the metric system, units varied by region and often used irregular ratios (12 inches to a foot, 3 feet to a yard, and so on), making conversions and trade calculations cumbersome. A system based on powers of ten made calculations, science, and international trade far simpler.",
  },
];

const ARTICLES: ArticleDefinition[] = [
  {
    slug: "how-time-zones-work-utc-dst",
    title:
      "How Time Zones Work: UTC, Daylight Saving Time, and Why Clocks Differ Around the World",
    description:
      "How time zones are defined, why UTC is the global reference point, why zone boundaries follow borders instead of straight lines of longitude, and why daylight saving time changes the time difference between two places during the year.",
    publishedAt: "2026-09-14",
    status: "published",
    category: "time",
    relatedRoutes: ["/timezone"],
    relatedArticleSlugs: ["knots-mph-kmh-speed-units-explained"],
    faq: HOW_TIME_ZONES_WORK_FAQ,
    content: (
      <>
        <p>
          A time zone is a region that keeps a single, agreed-upon time,
          usually defined as a fixed offset from Coordinated Universal Time
          (UTC). The world is divided into roughly 24 of these zones because
          the Earth rotates 360 degrees every 24 hours &mdash; 15 degrees of
          longitude per hour &mdash; so places at different longitudes see
          the sun at different moments and need different clock times to
          keep &quot;noon&quot; close to the sun&apos;s highest point.
          Daylight saving time (DST) adds a seasonal, one-hour shift on top
          of that offset in some regions, which is why the time difference
          between two cities can change twice a year.
        </p>

        <ArticleSection title="What is a time zone and why do we need them?">
          <ArticleSubsection title="Local mean time">
            <p>
              For most of human history, time was a local phenomenon. Towns
              set their clocks based on the position of the sun: when the
              sun reached its highest point in the sky (solar noon), the
              town clock struck 12:00. This system, known as local mean
              time, worked for an agrarian society where travel was slow
              &mdash; a few minutes of difference between two towns&apos;
              &quot;noons&quot; didn&apos;t matter.
            </p>
          </ArticleSubsection>
          <ArticleSubsection title="The railway problem">
            <p>
              The railway changed that. Trains could move faster than the
              sun&apos;s apparent motion across the sky, so a timetable
              based on each station&apos;s own local noon quickly became
              unworkable. In the 1800s, different railroad companies in the
              United States ran on dozens of different local &quot;standard&quot;
              times, causing scheduling confusion and, at times, collisions.
            </p>
          </ArticleSubsection>
          <ArticleSubsection title="The Greenwich meridian and UTC">
            <p>
              The fix was to replace local solar time with standardized
              zones. At the 1884 International Meridian Conference in
              Washington, D.C., representatives from 25 nations agreed that
              the Prime Meridian (0&deg; longitude) would run through the
              Royal Observatory in Greenwich, England. The globe was divided
              into 24 slices of 15 degrees of longitude, each one hour apart.
              This reference point was called Greenwich Mean Time (GMT),
              which today is also know as Coordinated Universal Time (UTC).
              Every time zone can be defined as an offset from
              it &mdash; for example, UTC-5 or UTC+9.
            </p>
          </ArticleSubsection>
        </ArticleSection>

        <ArticleSection title="Why time zones run east-west, not north-south">
          <p>
            Time zones are defined by longitude, the vertical lines running
            from the North Pole to the South Pole, not by latitude.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Why east/west matters:</strong> The Earth rotates on
              its axis from west to east, which is why the sun appears to
              rise in the east and set in the west. As a location rotates
              into sunlight it experiences morning, and because different
              longitudes face the sun at different moments, noon in London
              is dawn in New York and sunset in Tokyo. This is also why
              flying east or west (say, New York to London) causes jet lag,
              while flying mostly north or south along a similar longitude
              (say, New York to Bogot&aacute;) does not.
            </li>
            <li>
              <strong>Why north/south doesn&apos;t:</strong> Latitude
              determines climate and how long daylight lasts, but not the
              time of day. Every point on the same line of longitude, from
              the Arctic to the tropics, experiences the same phase of the
              day at the same moment.
            </li>
          </ul>
        </ArticleSection>

        <ArticleSection title="Why time zone boundaries zigzag: political vs. geographic time">
          <p>
            In a purely mathematical system, time zones would be straight
            lines 15 degrees apart. On an actual map, the boundaries zigzag
            along country and state borders instead. Governments prioritize
            economic and political unity over geographic precision: China
            spans five geographical time zones but officially observes only
            one, Beijing Time, and in the United States state borders often
            determine where a time zone boundary falls so that a single
            state isn&apos;t split across two hours. This is why converting
            between time zones takes a lookup of political boundaries, not
            just a longitude calculation.
          </p>
        </ArticleSection>

        <ArticleSection title="What is daylight saving time (DST) and why does it exist?">
          <ArticleSubsection title="What DST is">
            <p>
              Daylight saving time is the practice of setting clocks forward
              by one hour during the warmer months, then back again in
              autumn &mdash; &quot;spring forward, fall back.&quot; While it
              is in effect, a location&apos;s UTC offset is one hour higher
              than its standard-time offset.
            </p>
          </ArticleSubsection>
          <ArticleSubsection title="Why DST was introduced">
            <p>
              DST is often assumed to have been created for farmers, but
              farmers have historically opposed it because livestock follow
              the sun, not the clock. It was widely adopted during World War
              I, starting with Germany and its allies, to conserve coal by
              shifting an hour of daylight from the morning (when most
              people are still asleep) to the evening (when energy use for
              lighting is higher). Later adoption has also been justified by
              claims about retail activity, outdoor exercise, and evening
              traffic safety.
            </p>
          </ArticleSubsection>
          <ArticleSubsection title="Why DST complicates time zone conversion">
            <p>
              DST observance is inconsistent around the world, which is what
              makes converting between time zones harder than a fixed
              offset:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Most of Europe and North America observe it.</li>
              <li>Most of Africa and Asia do not.</li>
              <li>
                Countries that do observe it change their clocks on
                different dates &mdash; the US and the EU, for example,
                start and end DST on different weeks.
              </li>
              <li>
                Some regions within a country opt out entirely (Arizona in
                the US, for instance).
              </li>
            </ul>
            <p>
              As a result, the time difference between two places can change
              during the year. The gap between New York and London is
              usually 5 hours, but narrows to 4 hours for a few weeks each
              spring, because the US begins DST before the UK does.
            </p>
          </ArticleSubsection>
        </ArticleSection>

        <ArticleFAQ items={HOW_TIME_ZONES_WORK_FAQ} />

        <ArticleCallout title="Look up a specific time zone or DST schedule">
          <p>
            The{" "}
            <Link
              href="/definitions/timezones/daylight-saving-time"
              className="underline"
            >
              daylight saving time definition
            </Link>{" "}
            lists the exact dates each region springs forward and falls
            back. The{" "}
            <Link href="/definitions/timezones" className="underline">
              full list of time zones
            </Link>{" "}
            covers UTC offsets for every zone.
          </p>
        </ArticleCallout>

        <ConverterLink
          href="/timezone"
          title="Time zone converter"
          description="Convert a specific time between two zones, with daylight saving time applied automatically."
        />
      </>
    ),
  },
  {
    slug: "celsius-fahrenheit-formula-and-history",
    title:
      "Celsius vs. Fahrenheit: The Conversion Formula and the History Behind Two Temperature Scales",
    description:
      "The formula for converting between Celsius and Fahrenheit, how each scale was defined, and why the United States still measures temperature in Fahrenheit while most of the world uses Celsius.",
    publishedAt: "2026-09-14",
    status: "published",
    category: "temperature",
    relatedRoutes: ["/celsius-fahrenheit"],
    relatedArticleSlugs: [
      "metric-vs-imperial-why-the-us-is-different",
      "history-of-the-metric-system",
    ],
    faq: CELSIUS_FAHRENHEIT_FAQ,
    howTo: {
      name: "Convert Celsius to Fahrenheit",
      steps: [
        {
          name: "Multiply by 9/5",
          text: "Multiply the Celsius temperature by 9/5 (1.8).",
        },
        {
          name: "Add 32",
          text: "Add 32 to the result to get the temperature in Fahrenheit.",
        },
      ],
    },
    content: (
      <>
        <p>
          Celsius and Fahrenheit are both linear temperature scales, so
          converting between them is a matter of a fixed formula: multiply a
          Celsius value by 9/5 and add 32 to get Fahrenheit, or subtract 32
          and multiply by 5/9 to go from Fahrenheit back to Celsius. The
          scales differ because they were defined around different reference
          points roughly two decades apart, not because either one is more
          scientifically fundamental than the other.
        </p>

        <ArticleSection title="How each scale was defined">
          <ArticleSubsection title="Fahrenheit: built around a lab mixture and body temperature">
            <p>
              Daniel Gabriel Fahrenheit, a German physicist, proposed his
              scale around 1724. He set 0&deg;F near the freezing point of a
              saturated brine (salt and ice) solution, one of the coldest
              stable temperatures he could reliably produce in a laboratory
              at the time. He separately set roughly 96&deg;F near human body
              temperature. Water&apos;s freezing and boiling points fell out
              of that calibration at 32&deg;F and 212&deg;F &mdash; 180
              degrees apart, which is why the scale has that somewhat
              arbitrary-looking spread.
            </p>
          </ArticleSubsection>
          <ArticleSubsection title="Celsius: built around water">
            <p>
              Anders Celsius, a Swedish astronomer, proposed his scale in
              1742 using water&apos;s freezing and boiling points directly:
              originally 0&deg; for boiling and 100&deg; for freezing, later
              reversed to the 0&deg;C freezing / 100&deg;C boiling convention
              used today. Because it is defined around round numbers for a
              universally available reference substance, Celsius became the
              basis for the metric system&apos;s temperature unit and, later,
              the kelvin.
            </p>
          </ArticleSubsection>
        </ArticleSection>

        <ArticleSection title="The conversion formula">
          <p>
            Both scales are linear, so a single formula converts between
            them in either direction:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Celsius to Fahrenheit:</strong> &deg;F = (&deg;C ×
              9/5) + 32
            </li>
            <li>
              <strong>Fahrenheit to Celsius:</strong> &deg;C = (&deg;F − 32)
              × 5/9
            </li>
          </ul>
          <p>
            The two scales intersect at −40 degrees &mdash; −40&deg;C is
            exactly −40&deg;F, the only point where both scales agree.
          </p>
        </ArticleSection>

        <ArticleSection title="Why the US still uses Fahrenheit">
          <p>
            Fahrenheit remains the everyday standard in the United States
            (and is used alongside Celsius in a few territories) largely
            because of inertia: by the time the metric system spread
            globally in the 19th and 20th centuries, Fahrenheit was already
            deeply embedded in US weather reporting, home thermostats, and
            cooking. Many Americans also find Fahrenheit&apos;s finer
            granularity convenient for describing everyday weather, since it
            uses a wider range of whole numbers (roughly 0&ndash;100) to
            describe typical outdoor temperatures than Celsius does.
          </p>
        </ArticleSection>

        <ArticleFAQ items={CELSIUS_FAHRENHEIT_FAQ} />

        <ConverterLink
          href="/celsius-fahrenheit"
          title="Celsius to Fahrenheit converter"
          description="Convert a specific temperature between Celsius and Fahrenheit."
        />
      </>
    ),
  },
  {
    slug: "metric-vs-imperial-why-the-us-is-different",
    title:
      "Metric vs. Imperial: Why the US Still Uses Miles, Pounds, and Fahrenheit",
    description:
      "Why most of the world measures in meters, kilograms, and Celsius, why the United States still uses miles, pounds, and Fahrenheit, and what the base units of the metric system actually are.",
    publishedAt: "2026-09-14",
    status: "published",
    category: "measurement-systems",
    relatedRoutes: ["/km-miles"],
    relatedArticleSlugs: [
      "history-of-the-metric-system",
      "celsius-fahrenheit-formula-and-history",
      "mass-vs-weight-kg-lb-oz-explained",
    ],
    faq: METRIC_IMPERIAL_FAQ,
    content: (
      <>
        <p>
          Nearly every country in the world uses the metric system (the
          International System of Units, or SI) as its official system of
          measurement. The United States is the most prominent exception,
          continuing to use miles, pounds, and Fahrenheit in everyday life
          despite having formally recognized the metric system as
          preferred since 1975.
        </p>

        <ArticleSection title="Where the imperial system came from">
          <p>
            The units now called &quot;imperial&quot; &mdash; inches, feet,
            miles, pounds, and ounces &mdash; evolved over centuries from
            Roman, Anglo-Saxon, and medieval English measures, many based on
            everyday physical references like the length of a foot or the
            weight a person could carry. Britain formalized these into the
            imperial system in 1824. The United States inherited earlier
            versions of these units from British colonial rule and has kept
            largely similar definitions ever since, even after the UK itself
            moved toward metric.
          </p>
        </ArticleSection>

        <ArticleSection title="Why the US hasn't fully switched to metric">
          <p>
            The Metric Conversion Act of 1975 declared the metric system the
            preferred system of measurement for US trade and commerce, and
            established a board to coordinate voluntary conversion. Unlike
            similar efforts in other countries, it set no mandatory deadlines
            or requirements, and public and industry resistance &mdash; along
            with the cost of replacing tools, signage, and manufacturing
            standards &mdash; led the effort to stall by the 1980s.
          </p>
          <p>
            In practice, the US already relies on metric units extensively:
            science, medicine, the military, and manufacturing for export all
            use metric measurements. Metric units also appear on US product
            labels alongside imperial ones. It&apos;s specifically everyday
            consumer contexts &mdash; road signs, recipes, weather reports,
            body weight &mdash; where imperial units have persisted.
          </p>
        </ArticleSection>

        <ArticleSection title="What the metric system is built on">
          <p>
            The metric system&apos;s core strength is that its units scale by
            powers of ten, so converting between them is a matter of moving
            a decimal point rather than multiplying by an irregular ratio.
            The International System of Units defines seven base units:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Metre (m) &mdash; length</li>
            <li>Kilogram (kg) &mdash; mass</li>
            <li>Second (s) &mdash; time</li>
            <li>Ampere (A) &mdash; electric current</li>
            <li>Kelvin (K) &mdash; temperature</li>
            <li>Mole (mol) &mdash; amount of substance</li>
            <li>Candela (cd) &mdash; luminous intensity</li>
          </ul>
          <p>
            Every other metric unit, from square meters to kilowatt-hours, is
            derived from these seven.
          </p>
        </ArticleSection>

        <ArticleFAQ items={METRIC_IMPERIAL_FAQ} />

        <ConverterLink
          href="/km-miles"
          title="Kilometers to miles converter"
          description="Convert a specific distance between kilometers and miles."
        />
      </>
    ),
  },
  {
    slug: "baking-conversions-cups-tablespoons-grams",
    title: "Baking Measurement Conversions: Cups, Tablespoons, and Grams",
    description:
      "How to convert between cups, tablespoons, and grams when baking, why the same cup measurement can weigh differently for different ingredients, and why weighing ingredients gives more consistent results.",
    publishedAt: "2026-09-14",
    status: "published",
    category: "cooking",
    relatedRoutes: ["/cup-tbsp"],
    relatedArticleSlugs: [
      "mass-vs-weight-kg-lb-oz-explained",
      "metric-vs-imperial-why-the-us-is-different",
    ],
    faq: BAKING_CONVERSIONS_FAQ,
    howTo: {
      name: "Convert cups to grams for baking",
      steps: [
        {
          name: "Identify the ingredient",
          text: "Note which ingredient is being measured, since grams per cup vary by density (flour, sugar, and butter each convert differently).",
        },
        {
          name: "Apply the ingredient's conversion factor",
          text: "Multiply the number of cups by that ingredient's grams-per-cup figure, such as roughly 120 g per cup of all-purpose flour.",
        },
        {
          name: "Weigh for precision",
          text: "Use a kitchen scale when a recipe depends on precise ratios, since scooped volume measurements vary more than a single conversion factor can correct for.",
        },
      ],
    },
    content: (
      <>
        <p>
          Cups and tablespoons measure volume, while grams measure weight,
          so there is no single, universal conversion between them &mdash;
          the correct answer depends on the density of the specific
          ingredient being measured. A cup of flour and a cup of sugar
          contain the same volume but different weights, which is why
          precise recipes, especially in baking, increasingly specify
          weight rather than volume.
        </p>

        <ArticleSection title="Volume vs. weight in the kitchen">
          <p>
            Measuring cups and spoons (cups, tablespoons, teaspoons, fluid
            ounces) measure how much space an ingredient occupies. A kitchen
            scale measures how much an ingredient weighs, typically in grams
            or ounces. For liquids like water or milk, the two are almost
            interchangeable because their density is close to 1 gram per
            milliliter. For dry or aerated ingredients like flour, sugar, or
            butter, the relationship depends on how tightly the ingredient is
            packed.
          </p>
        </ArticleSection>

        <ArticleSection title="Common conversions">
          <p>
            A few reference points are useful for everyday cooking and
            baking:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>1 US cup = 16 tablespoons = 48 teaspoons</li>
            <li>1 tablespoon = 3 teaspoons</li>
            <li>1 US cup of water &asymp; 240 g</li>
            <li>1 US cup of all-purpose flour (spooned, not packed) &asymp; 120&ndash;125 g</li>
            <li>1 US cup of granulated sugar &asymp; 200 g</li>
          </ul>
          <p>
            These figures vary by brand, how finely an ingredient is milled,
            and how it&apos;s measured (scooped directly from the bag vs.
            spooned into the cup and leveled), which is one reason bakers
            who care about consistency prefer a scale.
          </p>
        </ArticleSection>

        <ArticleSection title="US cups vs. metric cups">
          <p>
            A US cup is defined as 240 mL. The &quot;metric cup&quot; used in
            Australia, New Zealand, and some UK recipes is defined as 250
            mL &mdash; about a 4% difference. That gap rarely matters for
            everyday cooking, but it can shift the outcome of recipes that
            depend on precise ratios, like bread or pastry.
          </p>
        </ArticleSection>

        <ArticleFAQ items={BAKING_CONVERSIONS_FAQ} />

        <ConverterLink
          href="/cup-tbsp"
          title="Cups to tablespoons converter"
          description="Convert a specific volume between cups and tablespoons."
        />
      </>
    ),
  },
  {
    slug: "mass-vs-weight-kg-lb-oz-explained",
    title: "Mass vs. Weight: Understanding Kilograms, Pounds, and Ounces",
    description:
      "The physical difference between mass and weight, how kilograms, pounds, and ounces relate to each other, and why everyday scales and recipes can treat mass and weight as interchangeable.",
    publishedAt: "2026-09-14",
    status: "published",
    category: "mass-weight",
    relatedRoutes: ["/kg-lb"],
    relatedArticleSlugs: [
      "metric-vs-imperial-why-the-us-is-different",
      "baking-conversions-cups-tablespoons-grams",
    ],
    faq: MASS_WEIGHT_FAQ,
    howTo: {
      name: "Convert kilograms to pounds",
      steps: [
        {
          name: "Multiply by 2.20462",
          text: "Multiply the mass in kilograms by 2.20462 to get the equivalent in pounds.",
        },
        {
          name: "Convert the remainder to ounces if needed",
          text: "Multiply any fractional pound value by 16 to express it in ounces.",
        },
      ],
    },
    content: (
      <>
        <p>
          Mass and weight are often used interchangeably in everyday
          language, but they measure different things. Mass is the amount of
          matter an object contains and stays constant wherever the object
          is. Weight is the force gravity exerts on that mass, which depends
          on location &mdash; the same object weighs less on the Moon than
          on Earth, even though its mass hasn&apos;t changed.
        </p>

        <ArticleSection title="Why the distinction rarely matters day to day">
          <p>
            On Earth&apos;s surface, gravitational acceleration is close
            enough to constant that weight is directly proportional to mass
            almost everywhere people live. That&apos;s why kilograms (a mass
            unit) and
            pounds (technically a unit that has been used for both mass and
            force, depending on context) can be used interchangeably for
            everyday purposes like body weight, food packaging, and shipping,
            without causing practical problems.
          </p>
        </ArticleSection>

        <ArticleSection title="Kilograms, pounds, and ounces">
          <p>
            The kilogram is the SI base unit of mass. The pound and ounce
            are the corresponding imperial units, related as follows:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>1 kilogram &asymp; 2.20462 pounds</li>
            <li>1 pound = 16 ounces (avoirdupois)</li>
            <li>1 pound &asymp; 453.6 grams</li>
          </ul>
          <p>
            The &quot;avoirdupois&quot; ounce, used for everyday goods like
            food and body weight, is different from the troy ounce used for
            precious metals like gold and silver. A troy ounce is heavier
            (about 31.1 g vs. about 28.3 g for an avoirdupois ounce), and
            there are only 12 troy ounces in a troy pound rather than 16.
          </p>
        </ArticleSection>

        <ArticleFAQ items={MASS_WEIGHT_FAQ} />

        <ConverterLink
          href="/kg-lb"
          title="Kilograms to pounds converter"
          description="Convert a specific mass between kilograms and pounds."
        />
      </>
    ),
  },
  {
    slug: "acres-hectares-square-meters-land-area-guide",
    title: "Acres, Hectares, and Square Meters: A Guide to Land Area Units",
    description:
      "Where the acre came from, how it compares to the metric hectare and square meter, and practical reference points for visualizing common land area units.",
    publishedAt: "2026-09-14",
    status: "published",
    category: "area",
    relatedRoutes: ["/acre-hectare"],
    relatedArticleSlugs: [
      "metric-vs-imperial-why-the-us-is-different",
      "history-of-the-metric-system",
    ],
    faq: LAND_AREA_FAQ,
    howTo: {
      name: "Convert acres to hectares",
      steps: [
        {
          name: "Multiply by 0.405",
          text: "Multiply the area in acres by approximately 0.405 to get hectares.",
        },
        {
          name: "Convert to square meters if needed",
          text: "Multiply the area in acres by approximately 4,047 to get the equivalent in square meters.",
        },
      ],
    },
    content: (
      <>
        <p>
          Land area is measured differently depending on the system: the
          acre in countries that use imperial units, and the hectare or
          square meter under the metric system. One acre is approximately
          4,047 square meters, or about 0.405 hectares &mdash; an
          unusual-looking ratio that comes from the acre&apos;s origin as a
          practical farming measure rather than a mathematically defined
          unit.
        </p>

        <ArticleSection title="Where the acre came from">
          <p>
            The acre dates to medieval England, where it originally
            described the amount of land a yoke of oxen could plow in a
            single day. It was standardized as a rectangle one furlong (660
            feet) long by one chain (66 feet) wide &mdash; 43,560 square
            feet. That agricultural origin, rather than a clean geometric
            definition, is why the acre doesn&apos;t convert to other units
            in round numbers.
          </p>
        </ArticleSection>

        <ArticleSection title="The hectare and square meter">
          <p>
            The hectare is the metric system&apos;s standard unit for land
            area: a square 100 meters on each side, equal to 10,000 square
            meters. It&apos;s used for farms, forests, parks, and urban
            planning in most countries outside the US. The square meter
            itself is used for smaller areas, like apartments and building
            floor plans.
          </p>
        </ArticleSection>

        <ArticleSection title="Putting the units in perspective">
          <ul className="list-disc space-y-1 pl-5">
            <li>1 acre &asymp; 4,047 m&sup2; &asymp; 0.405 hectares</li>
            <li>1 hectare = 10,000 m&sup2; &asymp; 2.47 acres</li>
            <li>
              A standard American football field (with end zones) is about
              1.32 acres, or roughly 0.53 hectares.
            </li>
            <li>
              A typical city block in many US grid layouts covers roughly 2
              to 5 acres, depending on the city.
            </li>
          </ul>
        </ArticleSection>

        <ArticleFAQ items={LAND_AREA_FAQ} />

        <ConverterLink
          href="/acre-hectare"
          title="Acres to hectares converter"
          description="Convert a specific land area between acres and hectares."
        />
      </>
    ),
  },
  {
    slug: "horsepower-vs-kilowatts-engine-power-explained",
    title: "Horsepower vs. Kilowatts: Comparing Engine Power Across Countries",
    description:
      "How horsepower and kilowatts both measure power, why European car specifications list kilowatts while others list horsepower, and why different definitions of horsepower can give slightly different converted figures.",
    publishedAt: "2026-09-14",
    status: "published",
    category: "power",
    relatedRoutes: ["/hp-kw"],
    relatedArticleSlugs: [
      "calories-vs-joules-energy-units-explained",
      "metric-vs-imperial-why-the-us-is-different",
    ],
    faq: HORSEPOWER_KW_FAQ,
    howTo: {
      name: "Convert horsepower to kilowatts",
      steps: [
        {
          name: "Multiply by 0.746",
          text: "Multiply the mechanical horsepower value by 0.746 to get kilowatts.",
        },
        {
          name: "Check which horsepower definition applies",
          text: "Confirm whether the source uses mechanical, metric (PS/CV), or electrical horsepower, since each uses a slightly different conversion factor.",
        },
      ],
    },
    content: (
      <>
        <p>
          Horsepower and kilowatts both measure power &mdash; the rate at
          which work is done or energy is transferred &mdash; not energy
          itself. One mechanical horsepower is approximately 0.746
          kilowatts. The reason car listings sometimes show one unit and
          sometimes the other comes down to which measurement system a
          country&apos;s vehicle regulations are based on.
        </p>

        <ArticleSection title="Where horsepower came from">
          <p>
            James Watt, the 18th-century Scottish engineer, coined the term
            &quot;horsepower&quot; to market his improved steam engines by
            comparing their output to the working rate of a horse. The unit
            stuck, long after steam engines gave way to internal combustion
            and electric motors, and it remains the default way car power is
            described in the US and several other countries.
          </p>
        </ArticleSection>

        <ArticleSection title="Why Europe uses kilowatts">
          <p>
            The European Union&apos;s official vehicle specifications use the
            metric system, so engine power is legally expressed in
            kilowatts. Many European manufacturers still list horsepower (or
            its metric cousin, PS/CV) alongside kW in marketing material,
            since horsepower remains a more intuitive number for most
            consumers.
          </p>
        </ArticleSection>

        <ArticleSection title="Not all horsepower is equal">
          <p>
            Several historical definitions of horsepower exist, and they
            don&apos;t all convert identically:
          </p>
          <DefinitionTable
            caption="Horsepower definitions compared"
            head={
              <>
                <DefinitionTableHeadCell>Definition</DefinitionTableHeadCell>
                <DefinitionTableHeadCell>Equal to</DefinitionTableHeadCell>
                <DefinitionTableHeadCell>Used in</DefinitionTableHeadCell>
              </>
            }
          >
            <DefinitionTableRow>
              <DefinitionTableCell isHeader>
                Mechanical horsepower (hp)
              </DefinitionTableCell>
              <DefinitionTableCell>&asymp; 745.7 watts</DefinitionTableCell>
              <DefinitionTableCell>
                US and UK vehicle and engine specifications
              </DefinitionTableCell>
            </DefinitionTableRow>
            <DefinitionTableRow>
              <DefinitionTableCell isHeader>
                Metric horsepower (PS or CV)
              </DefinitionTableCell>
              <DefinitionTableCell>&asymp; 735.5 watts</DefinitionTableCell>
              <DefinitionTableCell>
                Much of continental Europe
              </DefinitionTableCell>
            </DefinitionTableRow>
            <DefinitionTableRow>
              <DefinitionTableCell isHeader>
                Electrical horsepower
              </DefinitionTableCell>
              <DefinitionTableCell>Exactly 746 watts</DefinitionTableCell>
              <DefinitionTableCell>
                Electrical engineering contexts
              </DefinitionTableCell>
            </DefinitionTableRow>
          </DefinitionTable>
          <p>
            The differences are small enough to ignore for casual
            comparisons, but they explain why converting a
            manufacturer&apos;s quoted horsepower figure to kilowatts (or
            vice versa) can land a few tenths off from another
            source&apos;s number.
          </p>
        </ArticleSection>

        <ArticleFAQ items={HORSEPOWER_KW_FAQ} />

        <ConverterLink
          href="/hp-kw"
          title="Horsepower to kilowatts converter"
          description="Convert a specific power output between horsepower and kilowatts."
        />
      </>
    ),
  },
  {
    slug: "calories-vs-joules-energy-units-explained",
    title: "Calories vs. Joules: Energy Units in Food and Physics",
    description:
      "The difference between a food Calorie and a physics calorie, how calories relate to joules, and why nutrition labels and scientific measurements use different energy units.",
    publishedAt: "2026-09-14",
    status: "published",
    category: "energy",
    relatedRoutes: ["/kwh-kcal"],
    relatedArticleSlugs: [
      "horsepower-vs-kilowatts-engine-power-explained",
      "metric-vs-imperial-why-the-us-is-different",
    ],
    faq: CALORIES_JOULES_FAQ,
    howTo: {
      name: "Convert food Calories to kilojoules",
      steps: [
        {
          name: "Identify the Calorie value",
          text: "Note the food energy value in kilocalories (kcal), which is what nutrition labels call \"Calories\".",
        },
        {
          name: "Multiply by 4.184",
          text: "Multiply the kcal value by 4.184 to convert it to kilojoules (kJ).",
        },
      ],
    },
    content: (
      <>
        <p>
          The calorie and the joule both measure energy, but they come from
          different scientific traditions and are used in different
          contexts. A joule is the SI (metric) unit of energy, used
          throughout physics and engineering. A calorie is an older unit
          originally defined around heating water, and it still dominates
          food labeling in its kilocalorie form &mdash; the &quot;Calorie&quot;
          printed on nutrition labels.
        </p>

        <ArticleSection title="The food Calorie vs. the physics calorie">
          <p>
            This is the single most common source of confusion: the
            &quot;Calorie&quot; on a nutrition label (often capitalized, or
            written as kcal) is actually a kilocalorie &mdash; 1,000 small
            calories. A 200-Calorie snack contains 200,000 small calories of
            food energy. The convention of using the capital-C Calorie for
            food dates back to 19th-century nutrition science and has stuck
            in the US and several other countries ever since.
          </p>
        </ArticleSection>

        <ArticleSection title="Converting between calories and joules">
          <DefinitionTable
            caption="Calorie and joule conversions"
            head={
              <>
                <DefinitionTableHeadCell>Unit</DefinitionTableHeadCell>
                <DefinitionTableHeadCell>Equal to</DefinitionTableHeadCell>
              </>
            }
          >
            <DefinitionTableRow>
              <DefinitionTableCell isHeader>
                1 small calorie (cal)
              </DefinitionTableCell>
              <DefinitionTableCell>&asymp; 4.184 joules</DefinitionTableCell>
            </DefinitionTableRow>
            <DefinitionTableRow>
              <DefinitionTableCell isHeader>
                1 kilocalorie (kcal, or food Calorie)
              </DefinitionTableCell>
              <DefinitionTableCell>
                &asymp; 4,184 joules &asymp; 4.18 kJ
              </DefinitionTableCell>
            </DefinitionTableRow>
          </DefinitionTable>
          <p>
            The joule is named after James Prescott Joule, whose 19th-century
            experiments demonstrated the equivalence of heat and mechanical
            work &mdash; a foundational result in thermodynamics. Because the
            joule is the SI unit, scientific and engineering contexts
            (electricity bills in kWh aside) generally prefer it over the
            calorie.
          </p>
        </ArticleSection>

        <ArticleSection title="Why nutrition labels haven't switched to joules">
          <p>
            Some countries, including EU member states, already require
            kilojoules alongside kilocalories on food packaging. The US and
            several other countries still use kilocalories exclusively on
            consumer labels, largely because of how entrenched the
            &quot;Calorie&quot; convention already is in public understanding
            of diet and nutrition.
          </p>
        </ArticleSection>

        <ArticleFAQ items={CALORIES_JOULES_FAQ} />

        <ConverterLink
          href="/kwh-kcal"
          title="Kilowatt-hours to kilocalories converter"
          description="Convert a specific amount of energy between kilowatt-hours and kilocalories."
        />
      </>
    ),
  },
  {
    slug: "bar-psi-pascal-pressure-units-explained",
    title: "Bar, PSI, and Pascals: Understanding Pressure Units",
    description:
      "What a pascal, bar, and PSI each measure, how they relate to one another, and why weather reports, tire gauges, and engineering specifications each favor a different pressure unit.",
    publishedAt: "2026-09-14",
    status: "published",
    category: "pressure",
    relatedRoutes: ["/bar-psi"],
    relatedArticleSlugs: [
      "knots-mph-kmh-speed-units-explained",
      "metric-vs-imperial-why-the-us-is-different",
    ],
    faq: PRESSURE_UNITS_FAQ,
    howTo: {
      name: "Convert PSI to bar",
      steps: [
        {
          name: "Multiply by 0.0689",
          text: "Multiply the pressure in PSI by approximately 0.0689 to get bar.",
        },
        {
          name: "Convert to pascals if needed",
          text: "Multiply the pressure in PSI by approximately 6,895 to get the equivalent in pascals.",
        },
      ],
    },
    content: (
      <>
        <p>
          Pressure &mdash; force distributed over an area &mdash; is
          measured in several units depending on the field: the pascal (the
          SI unit), the bar (common in Europe and everyday contexts like
          tire pressure abroad), and PSI, or pounds per square inch (standard
          in the US for tires, tools, and plumbing). All three describe the
          same physical quantity; they simply scale differently.
        </p>

        <ArticleSection title="The pascal: the SI unit of pressure">
          <p>
            A pascal (Pa) is defined as one newton of force applied over one
            square meter. It&apos;s a small unit for most everyday pressures
            &mdash; standard atmospheric pressure is about 101,325 Pa &mdash;
            which is why weather reports typically use kilopascals (kPa) or
            hectopascals (hPa), and engineering specifications often use
            megapascals (MPa).
          </p>
        </ArticleSection>

        <ArticleSection title="Bar and PSI in everyday use">
          <p>
            The bar is defined as exactly 100,000 Pa, chosen because
            it&apos;s close to average sea-level atmospheric pressure (1 bar
            &asymp; 0.987 atm), which makes it convenient for describing pressures
            people intuitively understand, like tire pressure or water
            pressure. PSI, by contrast, is the imperial-derived unit still
            standard in the US for tires, compressors, and plumbing.
          </p>
          <DefinitionTable
            caption="Pressure unit conversions"
            head={
              <>
                <DefinitionTableHeadCell>Unit</DefinitionTableHeadCell>
                <DefinitionTableHeadCell>Equal to</DefinitionTableHeadCell>
              </>
            }
          >
            <DefinitionTableRow>
              <DefinitionTableCell isHeader>1 bar</DefinitionTableCell>
              <DefinitionTableCell>&asymp; 14.5 PSI</DefinitionTableCell>
            </DefinitionTableRow>
            <DefinitionTableRow>
              <DefinitionTableCell isHeader>1 atm</DefinitionTableCell>
              <DefinitionTableCell>
                &asymp; 1.013 bar &asymp; 14.7 PSI
              </DefinitionTableCell>
            </DefinitionTableRow>
            <DefinitionTableRow>
              <DefinitionTableCell isHeader>1 PSI</DefinitionTableCell>
              <DefinitionTableCell>&asymp; 6,895 Pa (6.895 kPa)</DefinitionTableCell>
            </DefinitionTableRow>
          </DefinitionTable>
        </ArticleSection>

        <ArticleSection title="Reading a tire pressure recommendation">
          <p>
            The correct tire pressure for a vehicle is set by the
            manufacturer, usually shown on a sticker inside the
            driver&apos;s door or in the owner&apos;s manual, not the maximum
            pressure printed on the tire&apos;s sidewall (which represents
            the tire&apos;s upper limit, not the recommended operating
            pressure). Pressure gauges and pumps outside the US commonly
            read in bar; those in the US typically read in PSI.
          </p>
        </ArticleSection>

        <ArticleFAQ items={PRESSURE_UNITS_FAQ} />

        <ConverterLink
          href="/bar-psi"
          title="Bar to PSI converter"
          description="Convert a specific pressure between bar and PSI."
        />
      </>
    ),
  },
  {
    slug: "knots-mph-kmh-speed-units-explained",
    title: "Knots, MPH, and KM/H: Why Speed Units Differ by Land, Air, and Sea",
    description:
      "Why ships and aircraft measure speed in knots, how knots relate to mph and km/h, and why some countries still use miles per hour for road speeds while most of the world uses kilometers per hour.",
    publishedAt: "2026-09-14",
    status: "published",
    category: "speed",
    relatedRoutes: ["/kmh-mph"],
    relatedArticleSlugs: [
      "how-time-zones-work-utc-dst",
      "metric-vs-imperial-why-the-us-is-different",
    ],
    faq: SPEED_UNITS_FAQ,
    howTo: {
      name: "Convert knots to mph",
      steps: [
        {
          name: "Multiply by 1.15078",
          text: "Multiply the speed in knots by approximately 1.15078 to get miles per hour.",
        },
        {
          name: "Convert to km/h if needed",
          text: "Multiply the speed in knots by approximately 1.852 to get kilometers per hour.",
        },
      ],
    },
    content: (
      <>
        <p>
          Speed is measured in different units depending on the domain: mph
          or km/h for road travel, and knots for maritime and aviation
          navigation. A knot equals one nautical mile per hour, which is
          approximately 1.15 mph or 1.852 km/h &mdash; a unit that persists
          in ships and planes mainly because of its direct link to
          navigational charts rather than any advantage in raw speed
          measurement.
        </p>

        <ArticleSection title="Why knots exist">
          <p>
            The nautical mile was defined so that one minute of latitude on
            the Earth&apos;s surface equals one nautical mile, tying distance
            directly to a ship&apos;s position on a chart. Speed measured in
            nautical miles per hour &mdash; knots &mdash; therefore let
            sailors relate their speed directly to distance covered on the
            chart, without converting between different distance units. The
            name comes from an older method of measuring ship speed using a
            knotted rope let out over a fixed time.
          </p>
        </ArticleSection>

        <ArticleSection title="Why aviation kept using knots">
          <p>
            Modern aviation adopted the same nautical mile and knot
            convention used at sea, since long-distance flight navigation
            relies on the same latitude/longitude chart system. Air traffic
            control, flight plans, and airspeed indicators worldwide
            generally use knots, regardless of whether the country uses
            metric or imperial units on the ground.
          </p>
        </ArticleSection>

        <ArticleSection title="Road speeds: mph vs. km/h">
          <p>
            On land, most countries measure speed limits in kilometers per
            hour, consistent with their broader use of the metric system.
            The United States uses miles per hour. The United Kingdom is a
            notable partial exception: it uses metric units in most
            contexts but has kept miles and mph for road distances and
            speed limits, largely due to the cost and disruption of
            replacing existing road signage nationwide.
          </p>
          <DefinitionTable
            caption="Speed unit conversions"
            head={
              <>
                <DefinitionTableHeadCell>Unit</DefinitionTableHeadCell>
                <DefinitionTableHeadCell>Equal to</DefinitionTableHeadCell>
              </>
            }
          >
            <DefinitionTableRow>
              <DefinitionTableCell isHeader>1 knot</DefinitionTableCell>
              <DefinitionTableCell>
                &asymp; 1.15 mph &asymp; 1.852 km/h
              </DefinitionTableCell>
            </DefinitionTableRow>
            <DefinitionTableRow>
              <DefinitionTableCell isHeader>1 mph</DefinitionTableCell>
              <DefinitionTableCell>&asymp; 1.609 km/h</DefinitionTableCell>
            </DefinitionTableRow>
          </DefinitionTable>
        </ArticleSection>

        <ArticleFAQ items={SPEED_UNITS_FAQ} />

        <ConverterLink
          href="/kmh-mph"
          title="km/h to mph converter"
          description="Convert a specific speed between kilometers per hour and miles per hour."
        />
      </>
    ),
  },
  {
    slug: "history-of-the-metric-system",
    title: "A Brief History of the Metric System",
    description:
      "How the metric system was created during the French Revolution, how the definition of the meter evolved from a physical bar to a fixed physical constant, and how metric units became the global standard.",
    publishedAt: "2026-09-14",
    status: "published",
    category: "measurement-systems",
    relatedRoutes: ["/km-miles"],
    relatedArticleSlugs: [
      "metric-vs-imperial-why-the-us-is-different",
      "celsius-fahrenheit-formula-and-history",
    ],
    faq: METRIC_HISTORY_FAQ,
    content: (
      <>
        <p>
          The metric system was created in France in the 1790s, during the
          French Revolution, as a deliberate replacement for the patchwork
          of regional measurement units that had made trade and science
          needlessly complicated. Its core idea &mdash; that units of
          measurement should scale in powers of ten and be based on
          reproducible physical constants rather than royal decree or local
          custom &mdash; is why it became the basis for the modern
          International System of Units (SI).
        </p>

        <ArticleSection title="A revolutionary measurement system">
          <p>
            Before the metric system, France alone used hundreds of
            different local units for length, weight, and volume, many
            varying from town to town. The French Academy of Sciences was
            commissioned to design a unified, rational system based on
            nature rather than arbitrary reference points. The result,
            adopted in the 1790s, defined the meter as one ten-millionth of
            the distance from the North Pole to the equator, measured along
            a meridian passing through Paris.
          </p>
        </ArticleSection>

        <ArticleSection title="From a physical bar to a physical constant">
          <p>
            For most of the metric system&apos;s history, the meter was
            defined by physical reference objects: first a platinum bar, later a
            platinum-iridium bar kept near Paris. In 1960, the meter was
            redefined in terms of the wavelength of light emitted by
            krypton-86. Since 1983, it has been defined as the distance
            light travels in a vacuum in 1/299,792,458 of a second &mdash; a
            definition based on a universal physical constant rather than
            any physical artifact that could be damaged, lost, or drift
            slightly over time.
          </p>
        </ArticleSection>

        <ArticleSection title="Global adoption">
          <p>
            The metric system spread gradually through the 19th and 20th
            centuries, adopted first across much of continental Europe and
            eventually by nearly every country in the world for official use.
            The International System of Units (SI), formalized in 1960,
            standardized the metric system&apos;s modern base units and is
            now the world&apos;s dominant measurement system, with the
            United States as the most prominent holdout for everyday,
            non-scientific use.
          </p>
        </ArticleSection>

        <ArticleFAQ items={METRIC_HISTORY_FAQ} />

        <ConverterLink
          href="/km-miles"
          title="Kilometers to miles converter"
          description="Convert a specific distance between kilometers and miles."
        />
      </>
    ),
  },
  {
    slug: "example-conversion-guide",
    title: "Example conversion guide",
    description:
      "A draft article used to preview and validate the ConverterStack article template.",
    publishedAt: "2026-09-04",
    status: "draft",
    category: "general",
    relatedRoutes: ["/cm-inches"],
    content: (
      <>
        <ArticleCallout title="Draft example">
          <p>
            This page demonstrates the article template. Replace this copy and
            review the article before changing its status to published.
          </p>
        </ArticleCallout>

        <ArticleSection title="Start with the units">
          <p>
            A useful conversion guide explains what the source and destination
            units measure before showing the calculation.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Introduce the units in plain language.</li>
            <li>State the conversion factor or formula.</li>
            <li>Provide a practical example.</li>
          </ul>
        </ArticleSection>

        <ArticleSection title="Use the converter">
          <p>
            Link readers directly to the relevant tool so the article supports
            the conversion task instead of interrupting it.
          </p>
          <ConverterLink
            href="/cm-inches"
            title="Convert centimeters to inches"
            description="Open the live converter and see a quick-reference table."
          />
        </ArticleSection>
      </>
    ),
  },
];

function validateArticles(articles: ArticleDefinition[]) {
  const slugs = new Set<string>();

  for (const article of articles) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)) {
      throw new Error(`Invalid article slug: ${article.slug}`);
    }
    if (slugs.has(article.slug)) {
      throw new Error(`Duplicate article slug: ${article.slug}`);
    }
    slugs.add(article.slug);

    if (Number.isNaN(Date.parse(article.publishedAt))) {
      throw new Error(`Invalid publishedAt date for article: ${article.slug}`);
    }
    if (article.updatedAt && Number.isNaN(Date.parse(article.updatedAt))) {
      throw new Error(`Invalid updatedAt date for article: ${article.slug}`);
    }
    for (const route of article.relatedRoutes) {
      const isFixedConverterRoute =
        route === "/timezone" || route === "/exchangerate";
      const isUnitConverterRoute = parseSlug(route.slice(1)) !== undefined;
      if (!isFixedConverterRoute && !isUnitConverterRoute) {
        throw new Error(
          `Invalid related route "${route}" for article: ${article.slug}`,
        );
      }
    }

    if (article.howTo && article.howTo.steps.length === 0) {
      throw new Error(`howTo for article "${article.slug}" has no steps`);
    }
  }

  for (const article of articles) {
    for (const relatedSlug of article.relatedArticleSlugs ?? []) {
      if (relatedSlug === article.slug) {
        throw new Error(
          `Article "${article.slug}" cannot list itself as a related article`,
        );
      }
      if (!slugs.has(relatedSlug)) {
        throw new Error(
          `Article "${article.slug}" references unknown related article "${relatedSlug}"`,
        );
      }
    }
  }
}

validateArticles(ARTICLES);

export function getAllArticles(): readonly ArticleDefinition[] {
  return ARTICLES;
}

export function getPublishedArticles(): ArticleDefinition[] {
  return ARTICLES.filter((article) => article.status === "published");
}

export function getArticle(slug: string): ArticleDefinition | undefined {
  return ARTICLES.find((article) => article.slug === slug);
}

export function getPublishedArticlesForRoute(
  route: string,
): ArticleDefinition[] {
  return getPublishedArticles().filter((article) =>
    article.relatedRoutes.includes(route as `/${string}`),
  );
}

/** Resolves an article's curated `relatedArticleSlugs` to published articles. */
export function getRelatedArticles(slug: string): ArticleDefinition[] {
  const article = getArticle(slug);
  if (!article || !article.relatedArticleSlugs) return [];

  return article.relatedArticleSlugs
    .map((relatedSlug) => getArticle(relatedSlug))
    .filter(
      (related): related is ArticleDefinition =>
        related !== undefined && related.status === "published",
    );
}
