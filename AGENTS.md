# AGENTS.md

Guidance for coding agents working in `open-claw-session-analyzer`.

## Mission

Maintain and extend a client-side OpenClaw session analyzer that ingests `.jsonl` files and presents token/cost/latency analytics in a Next.js dashboard.

## High-Level Architecture

- Frontend framework: Next.js App Router (`app/`)
- UI composition: React client components (`components/`)
- State model: module-level store + `useSyncExternalStore`
  - store: `lib/analysis-store.ts`
  - hook: `hooks/use-analysis.ts`
- Parsing: `lib/parse-session-file.ts`
- Aggregation and formatting: `lib/compute-stats.ts`
- Pricing defaults and lookup: `lib/default-pricing.ts`
- Shared domain types: `lib/types.ts`

There is no backend/API for analytics. File parsing and all calculations are done in-browser.

## Critical Data Flow

1. User uploads one or more `.jsonl` files (`components/upload-dropzone.tsx`).
2. `app/page.tsx` reads file text and calls:
   - `parseSessionFile(text, fileName, onProgress)`
   - `computeStats(events, fileName, warnings)`
3. Results are written to shared store via `setFileStats`.
4. `components/dashboard.tsx` selects:
   - combined view (`mergeStats`) or
   - selected file view (`computeStats` with current pricing)
5. Charts/cards/table/highlights render from current computed stats.

## Important Behavioral Rules

- Parse warnings:
  - Malformed JSON lines are skipped and surfaced in warnings panel.
- Cost display:
  - Use recomputed cost from pricing map (`computeMessageCost` path).
  - Do not use `rawCost` for final cost display; `rawCost` is reference-only.
- Multi-file handling:
  - Current upload action resets existing state before processing new files.
- Pricing:
  - Pricing editor auto-discovers models from parsed events.
  - Defaults are auto-applied when pricing map is empty.

## Commands

Use Corepack pnpm commands (works even when global `pnpm` is missing):

```powershell
corepack pnpm install
corepack pnpm dev
corepack pnpm build
corepack pnpm start
```

If port `3000` is occupied:

```powershell
$env:PORT=3200
corepack pnpm start
```

## Validation Checklist For Changes

When touching parser/stats/store/dashboard logic, run:

1. `corepack pnpm build`
2. `corepack pnpm dev`, then verify:
   - upload still works
   - progress updates while parsing
   - warnings render for malformed lines
   - charts/table/highlights update
   - pricing edits change estimated cost
   - exports download valid files

For automated probe in PowerShell, you can run dev/start in background and hit HTTP endpoint with `Invoke-WebRequest`.

## Known Repo Quirks

- `package.json` lint script currently calls `next lint`, which fails in this setup.
- `next.config.mjs` sets `typescript.ignoreBuildErrors = true`.
  - Build can succeed with TS type issues; do not rely on build success as full type safety signal.
- Port 3000 may already be used by unrelated local processes.

## Editing Guidance

- Prefer minimal, focused changes.
- Keep parsing and aggregation logic deterministic and pure where possible.
- Preserve current type contracts in `lib/types.ts` unless intentionally migrating.
- If adding new metrics:
  - extend `FileStats` shape
  - compute in `computeStats`
  - surface in relevant UI components
  - keep combined/per-file behavior consistent

## File Ownership Map

- Upload and top-level page flow: `app/page.tsx`, `components/upload-dropzone.tsx`, `components/parse-progress.tsx`
- Shared state: `lib/analysis-store.ts`, `hooks/use-analysis.ts`
- Parsing and normalization: `lib/parse-session-file.ts`
- Metrics and formatting: `lib/compute-stats.ts`
- Pricing defaults/config UX: `lib/default-pricing.ts`, `components/model-pricing-config.tsx`
- Dashboard views:
  - overview/cards/charts: `components/summary-cards.tsx`, `components/charts.tsx`
  - timeline: `components/timeline-table.tsx`
  - highlights: `components/highlights.tsx`
  - export/warnings: `components/export-buttons.tsx`, `components/warnings-panel.tsx`

## Safe Extension Points

- Add parser normalization fields in `NormalizedEvent` and derive UI-only render fields in components.
- Add new chart cards by extending `components/charts.tsx` and keep empty-state handling explicit.
- Add new export formats by extending `components/export-buttons.tsx`.

## Avoid

- Introducing server-side parsing unless explicitly requested.
- Binding UI cost display to unreliable `rawCost`.
- Silent state mutations outside `analysis-store` setters.

