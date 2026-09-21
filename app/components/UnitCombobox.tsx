"use client";

import { useMemo } from "react";
import type { Unit } from "../lib/units";
import { CATEGORY_LABELS } from "../lib/units";
import Combobox from "./Combobox";

export default function UnitCombobox({
  value,
  options,
  onChange,
  label,
}: {
  value: string;
  options: Unit[];
  onChange: (id: string) => void;
  label: string;
}) {
  const comboOptions = useMemo(
    () =>
      options.map((unit) => ({
        id: unit.id,
        symbol: unit.symbol,
        label: unit.label,
        meta: CATEGORY_LABELS[unit.category],
      })),
    [options],
  );

  return (
    <Combobox
      value={value}
      options={comboOptions}
      onChange={onChange}
      label={label}
      placeholder="Select unit"
      searchPlaceholder="Search units…"
      searchLabel="Search units"
    />
  );
}
