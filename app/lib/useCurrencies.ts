"use client";

import { useEffect, useState } from "react";
import { getCurrencies, type Currency } from "./currency";

const EMPTY: readonly Currency[] = [];

/**
 * Currency list from /currencies.json. Empty on the server and on first paint,
 * then populated once the lazy fetch resolves. `getCurrencies()` is memoised,
 * so any number of mounted components share a single request.
 */
export function useCurrencies(): readonly Currency[] {
    const [currencies, setCurrencies] = useState<readonly Currency[]>(EMPTY);

    useEffect(() => {
        let cancelled = false;
        getCurrencies()
            .then((loaded) => {
                if (!cancelled) setCurrencies(loaded);
            })
            .catch(() => {
                // The UI degrades to bare codes; nothing to surface here.
            });
        return () => {
            cancelled = true;
        };
    }, []);

    return currencies;
}
