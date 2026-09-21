import type { Unit } from "../../lib/units";

type FigureProps = {
  name: string;
  symbol: string;
};

const AREA_SIDE_LENGTHS: Record<string, string> = {
  m2: "1 m",
  cm2: "1 cm",
  dm2: "1 dm",
  km2: "1 km",
  ft2: "1 ft",
  in2: "1 in",
  mi2: "1 mi",
  hectare: "100 m",
  acre: "≈ 63.61 m",
};

const VOLUME_EDGE_LENGTHS: Record<string, string> = {
  l: "10 cm",
  ml: "1 cm",
  m3: "1 m",
  cm3: "1 cm",
  dm3: "1 dm",
  ft3: "1 ft",
  in3: "1 in",
  gal: "≈ 15.58 cm",
  qt: "≈ 9.82 cm",
  pt: "≈ 7.79 cm",
};

function FigureFrame({
  name,
  caption,
  children,
}: FigureProps & {
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold tracking-tight">
        Visualizing {name.toLowerCase()}
      </h2>
      <figure className="overflow-hidden rounded-2xl border border-black/[.06] bg-white p-5 shadow-sm dark:border-white/[.08] dark:bg-zinc-900">
        {children}
        <figcaption className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {caption}
        </figcaption>
      </figure>
    </section>
  );
}

function LengthFigure({ name, symbol }: FigureProps) {
  return (
    <FigureFrame
      name={name}
      symbol={symbol}
      caption={`The marked distance represents a length of 1 ${symbol}. The illustration is conceptual and not drawn to physical scale.`}
    >
      <svg
        viewBox="0 0 480 160"
        className="h-auto w-full"
        aria-hidden="true"
      >
        <line
          x1="70"
          y1="88"
          x2="410"
          y2="88"
          className="stroke-blue-600 dark:stroke-blue-400"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <line
          x1="70"
          y1="58"
          x2="70"
          y2="118"
          className="stroke-zinc-700 dark:stroke-zinc-300"
          strokeWidth="3"
        />
        <line
          x1="410"
          y1="58"
          x2="410"
          y2="118"
          className="stroke-zinc-700 dark:stroke-zinc-300"
          strokeWidth="3"
        />
        <circle
          cx="70"
          cy="88"
          r="7"
          className="fill-blue-600 dark:fill-blue-400"
        />
        <circle
          cx="410"
          cy="88"
          r="7"
          className="fill-blue-600 dark:fill-blue-400"
        />
        <text
          x="240"
          y="55"
          textAnchor="middle"
          className="fill-zinc-900 text-2xl font-semibold dark:fill-zinc-100"
        >
          1 {symbol}
        </text>
        <text
          x="70"
          y="142"
          textAnchor="middle"
          className="fill-zinc-500 text-sm dark:fill-zinc-400"
        >
          0
        </text>
        <text
          x="410"
          y="142"
          textAnchor="middle"
          className="fill-zinc-500 text-sm dark:fill-zinc-400"
        >
          1 {symbol}
        </text>
      </svg>
    </FigureFrame>
  );
}

function AreaFigure({
  name,
  symbol,
  sideLength,
}: FigureProps & { sideLength: string }) {
  return (
    <FigureFrame
      name={name}
      symbol={symbol}
      caption={`A square measuring ${sideLength} by ${sideLength} has an area of 1 ${symbol}. The same area can have other shapes.`}
    >
      <svg
        viewBox="0 0 520 310"
        className="h-auto w-full"
        aria-hidden="true"
      >
        <rect
          x="150"
          y="20"
          width="220"
          height="220"
          rx="8"
          className="fill-blue-100 stroke-blue-600 dark:fill-blue-950 dark:stroke-blue-400"
          strokeWidth="4"
        />
        {[185, 240, 295].map((position) => (
          <g key={position}>
            <line
              x1={position + 20}
              y1="20"
              x2={position + 20}
              y2="240"
              className="stroke-blue-300 dark:stroke-blue-800"
              strokeWidth="1"
            />
            <line
              x1="150"
              y1={position - 110}
              x2="370"
              y2={position - 110}
              className="stroke-blue-300 dark:stroke-blue-800"
              strokeWidth="1"
            />
          </g>
        ))}
        <text
          x="260"
          y="140"
          textAnchor="middle"
          className="fill-blue-800 text-3xl font-semibold dark:fill-blue-200"
        >
          1 {symbol}
        </text>
        <line
          x1="150"
          y1="266"
          x2="370"
          y2="266"
          className="stroke-zinc-600 dark:stroke-zinc-300"
          strokeWidth="2"
        />
        <line
          x1="150"
          y1="256"
          x2="150"
          y2="276"
          className="stroke-zinc-600 dark:stroke-zinc-300"
          strokeWidth="2"
        />
        <line
          x1="370"
          y1="256"
          x2="370"
          y2="276"
          className="stroke-zinc-600 dark:stroke-zinc-300"
          strokeWidth="2"
        />
        <text
          x="260"
          y="296"
          textAnchor="middle"
          className="fill-zinc-700 text-base font-semibold dark:fill-zinc-200"
        >
          {sideLength}
        </text>
        <line
          x1="124"
          y1="20"
          x2="124"
          y2="240"
          className="stroke-zinc-600 dark:stroke-zinc-300"
          strokeWidth="2"
        />
        <line
          x1="114"
          y1="20"
          x2="134"
          y2="20"
          className="stroke-zinc-600 dark:stroke-zinc-300"
          strokeWidth="2"
        />
        <line
          x1="114"
          y1="240"
          x2="134"
          y2="240"
          className="stroke-zinc-600 dark:stroke-zinc-300"
          strokeWidth="2"
        />
        <text
          x="96"
          y="130"
          textAnchor="middle"
          className="fill-zinc-700 text-base font-semibold dark:fill-zinc-200"
          transform="rotate(-90 96 130)"
        >
          {sideLength}
        </text>
      </svg>
    </FigureFrame>
  );
}

function VolumeFigure({
  name,
  symbol,
  edgeLength,
}: FigureProps & { edgeLength: string }) {
  return (
    <FigureFrame
      name={name}
      symbol={symbol}
      caption={`A cube measuring ${edgeLength} along each of its three dimensions has a volume of 1 ${symbol}. Other shapes can have the same volume.`}
    >
      <svg
        viewBox="0 0 540 340"
        className="h-auto w-full"
        aria-hidden="true"
      >
        <polygon
          points="270,35 435,115 270,195 105,115"
          className="fill-blue-100 stroke-blue-600 dark:fill-blue-950 dark:stroke-blue-400"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <polygon
          points="105,115 270,195 270,305 105,225"
          className="fill-blue-200 stroke-blue-600 dark:fill-blue-900 dark:stroke-blue-400"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <polygon
          points="270,195 435,115 435,225 270,305"
          className="fill-blue-300 stroke-blue-600 dark:fill-blue-800 dark:stroke-blue-400"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <text
          x="270"
          y="150"
          textAnchor="middle"
          className="fill-blue-900 text-3xl font-semibold dark:fill-blue-100"
        >
          1 {symbol}
        </text>
        <text
          x="184"
          y="62"
          textAnchor="middle"
          className="fill-zinc-700 text-base font-semibold dark:fill-zinc-200"
          transform="rotate(-26 184 62)"
        >
          {edgeLength}
        </text>
        <text
          x="356"
          y="62"
          textAnchor="middle"
          className="fill-zinc-700 text-base font-semibold dark:fill-zinc-200"
          transform="rotate(26 356 62)"
        >
          {edgeLength}
        </text>
        <text
          x="460"
          y="170"
          textAnchor="middle"
          className="fill-zinc-700 text-base font-semibold dark:fill-zinc-200"
          transform="rotate(90 460 170)"
        >
          {edgeLength}
        </text>
      </svg>
    </FigureFrame>
  );
}

export default function UnitFigure({
  unit,
  name,
}: {
  unit: Unit;
  name: string;
}) {
  const props = { name, symbol: unit.symbol };

  switch (unit.category) {
    case "length":
      return <LengthFigure {...props} />;
    case "area":
      return (
        <AreaFigure
          {...props}
          sideLength={AREA_SIDE_LENGTHS[unit.id] ?? `1 ${unit.symbol}`}
        />
      );
    case "volume":
      return (
        <VolumeFigure
          {...props}
          edgeLength={VOLUME_EDGE_LENGTHS[unit.id] ?? `1 ${unit.symbol}`}
        />
      );
    default:
      return null;
  }
}
