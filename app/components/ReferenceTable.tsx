import { convert, type Unit } from "../lib/units";
import { formatNumber } from "../lib/format";

const SAMPLES = [1, 5, 10, 25, 100];

export default function ReferenceTable({
  from,
  to,
}: {
  from: Unit;
  to: Unit;
}) {
  return (
    <table className="w-full text-sm">
      <caption className="sr-only">
        Common conversions from {from.label} to {to.label}
      </caption>
      <thead>
        <tr className="text-left text-zinc-500">
          <th className="py-1 font-medium">{from.symbol}</th>
          <th className="py-1 font-medium">{to.symbol}</th>
        </tr>
      </thead>
      <tbody>
        {SAMPLES.map((n) => (
          <tr key={n} className="border-t border-black/5 dark:border-white/10">
            <td className="py-1 tabular-nums">{n}</td>
            <td className="py-1 tabular-nums">
              {formatNumber(convert(n, from, to), 4)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
