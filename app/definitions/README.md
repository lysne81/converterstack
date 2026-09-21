# Definitions system

`/definitions` is the unified landing page for all "definition" content in the
app — pages that explain what a conversion unit, currency, or time zone
abbreviation means, rather than converting a value. It currently covers three
kinds:

- **Units** — `/definitions/units` (index) and `/definitions/units/[unit_id]`
  (detail), backed by `units/units-definitions.tsx`.
- **Time zones** — `/definitions/timezones` (index) and
  `/definitions/timezones/[zone]` (detail), backed by
  `timezones/timezones-definitions.ts`. Time zone definitions describe the
  fixed UTC offset used by the converter.

  The collection also includes the standalone concept page
  `/definitions/timezones/daylight-saving-time`, which explains seasonal clock
  changes separately from the fixed-offset zone pages.

  The unit of content is a *meaning*, not an abbreviation. Abbreviations that
  mean different things in different places (AST, CST, EST, GST, IST) have one
  key, one offset and one page per meaning — `AST-atlantic` and `AST-arabia` —
  and each page links to the others under "Other meanings". Bare abbreviations
  resolve to the most widely used meaning through `resolveZoneKey` in
  `app/lib/timezone.ts`, so older links like `?from=EST` keep working.

  Everything derivable — offset, abbreviation, meaning name, military letter,
  sibling meanings, zones sharing an offset and the worked example — is
  generated from `BASES`, so the pages cannot drift from the converter. Only
  prose (description, usage, regions, cities, IANA zones, history, notes,
  confusions) is authored per zone, and a missing entry throws at build time.

- **Currencies** — `/definitions/currencies` (index) and
  `/definitions/currencies/[code]` (detail), sourced from
  `public/currencies.json`. Unlike units and time zones, currency content is
  not authored — it's a fact table (code, name, symbol, type, and the
  countries using each fiat currency) derived directly from the data file.

  `[code]/page.tsx` uses `getStaticCurrencies()` from
  `app/lib/currency-static.ts` (a build-time import of the JSON file) for
  `generateStaticParams` and metadata, but the actual detail page renders
  `CurrencyDefinitionLayout`, a client component that reads the record from
  the `useCurrencies()` hook — the same lazily-fetched, request-once source
  the converter and combobox use. This keeps the currency list a single
  runtime fetch (`/currencies.json`) instead of embedding the whole file in
  the client bundle; only the static route list needs the build-time import.

  `public/currencies.json` (and `public/ex_rates.json`) are gitignored and
  fetched by `scripts/fetch_currencies.sh` / `scripts/fetch_rates.sh`
  **before** `next build` runs (see `package.json`'s `deploy` script and the
  deploy workflows), so both files exist in `public/` for the build-time
  import above and get carried into `out/` by the static export for the
  runtime fetch. Run the fetch scripts locally (with `CURRENCY_API_KEY` set)
  before your first local build if `public/currencies.json` is missing.

  Country flags for the "Countries" fact come from `public/flags/<alpha-2
  code>.svg` (sourced from flagcdn.com) via `countryFlagSrc()` in
  `app/lib/countries.ts`; full country names come from `Intl.DisplayNames`
  via `countryName()`. A handful of special/historical codes in the source
  data (AC, CP, DG, EA, FX, IC, SU, TA) have no standard flag and render
  without an icon; `UK` is aliased to the `GB` flag.

Each kind lives in its own folder under `app/definitions/` with the same
shape: a data module, an index `page.tsx`, and a `[id]/page.tsx` detail
route. `app/definitions/page.tsx` links to all kind indexes and offers a
single search across every published item from every kind.

## Shared building blocks

Detail pages share layout primitives from `app/components/definitions/`
instead of duplicating markup per kind:

- `DefinitionShell.tsx` — the page chrome: back link, optional status badge,
  heading (name + secondary label), lead paragraph, and an optional meta line
  (e.g. a reviewed date).
- `DefinitionFacts.tsx` — `DefinitionFactList`/`DefinitionFact` render the
  `<dl>` of key facts (symbol, offset, region, etc.). A fact with no value
  renders nothing.
- `DefinitionContent.tsx` — `DefinitionSection`/`DefinitionCallout` for
  editorial prose sections and callouts, used by both unit content and
  `TimezoneDefinitionLayout.tsx`.
- `DefinitionTable.tsx` — `DefinitionTable`/`DefinitionTableRow`/
  `DefinitionTableCell`/`DefinitionTableHeadCell` render a styled, scrollable
  `<table>` for genuinely tabular reference data (e.g. the DST schedule table
  on the daylight saving time definition). Prefer `DefinitionFactList` for
  simple label/value facts; reach for `DefinitionTable` when there are
  multiple rows *and* multiple columns.
- `DefinitionsSearch.tsx` — a generic grouped search/browse list. Callers
  build `DefinitionSearchGroup[]` (a label plus `{ id, href, name, symbol,
  description? }` items); the component only renders and filters them. This
  is what powers the unit category groups on `/definitions/units`, the
  single time-zone group on `/definitions/timezones`, and the per-kind groups
  on the unified `/definitions` page.
- `UnitDefinitionLayout.tsx` / `TimezoneDefinitionLayout.tsx` /
  `CurrencyDefinitionLayout.tsx` — the kind-specific layouts that compose the
  primitives above plus any kind-specific pieces (e.g. `UnitFigure.tsx`).

Kind-specific content and metadata stay in each kind's own types
(`UnitDefinition`, `TimezoneDefinition`) rather than being forced into one
generic shape — only the *presentation* layer and the *search index* shape
are shared.

## Authoring unit definitions

Add reviewed content to `DEFINITION_CONTENT` in `units/units-definitions.tsx`,
keyed by an existing unit ID from `app/lib/units.ts`. Keep the entry as
`draft` while writing. Draft routes are available for preview but are
excluded from search engines, the `/definitions/units` index, the sitemap,
and contextual converter links.

Before changing an entry to `published`, include:

- a singular display name and direct one- or two-sentence definition
- the quantity measured, measurement system or tradition, and precise SI
  classification
- the exact relationship to a reference unit and any formula notes
- common uses and regions
- relevant history, symbol/name conventions, and ambiguous variants
- precision or rounding guidance where relevant
- a review date and authoritative sources
- useful examples, related units, and converter links in optional React content

Use `DefinitionSection` and `DefinitionCallout` from
`app/components/definitions/DefinitionContent.tsx` for editorial sections.
Only add FAQs when they answer genuine unit-specific questions; do not publish
generic filler or structured FAQ data without visible matching content.

## Adding a new kind

Cooking measures, formulas (e.g. BMI), and dedicated speed or pressure
write-ups are natural future kinds (cooking, speed, and pressure already
exist as unit *categories* in `app/lib/units.ts` and just need editorial
content authored in `units-definitions.tsx`; formulas need a new kind because
they aren't part of the unit model). To add a genuinely new kind:

1. Create `app/definitions/<kind-plural>/` with a data module exporting the
   list of entries plus `get<Kind>Definitions()`/`get<Kind>Definition(id)`
   lookups (and `getPublished<Kind>Definitions()` if the kind needs draft
   gating).
2. Add `<kind-plural>/page.tsx` (index) and `<kind-plural>/[id]/page.tsx`
   (detail), following the units or timezones folder as a template.
3. Build a `<Kind>DefinitionLayout.tsx` in
   `app/components/definitions/` that composes `DefinitionShell`,
   `DefinitionFacts`, and `DefinitionSection`/`DefinitionCallout` — reuse
   these instead of writing new chrome.
4. Register the kind on the unified `/definitions/page.tsx`: add a kind card
   and a `DefinitionSearchGroup` built from the new data module.
5. Add the kind's routes to `app/sitemap.ts`, following the existing
   units/timezones pattern (include the index only once there is published
   content, and set `alternates.canonical` on the detail page).
6. If the kind needs contextual "About this X" links from converter pages
   (like `UnitDefinitionLinks.tsx` does for units), add a small link
   component next to the kind's layout rather than growing an existing one.
