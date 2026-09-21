import { getPopularPairs, slugFor } from "../lib/units";
import ConverterCard from "./ConverterCard";
import SectionHeading, { FlameIcon } from "./SectionHeading";

export default function PopularConverters() {
  const pairs = getPopularPairs().slice(0, 12);

  return (
    <section className="flex flex-col gap-3">
      <SectionHeading icon={<FlameIcon />}>Most used</SectionHeading>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {pairs.map(({ from, to }) => (
          <li key={slugFor(from, to)}>
            <ConverterCard href={`/${slugFor(from, to)}`} from={from} to={to} />
          </li>
        ))}
      </ul>
    </section>
  );
}
