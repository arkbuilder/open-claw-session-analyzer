# OpenClaw Session Analyzer

Analyze OpenClaw session `.jsonl` files in the browser with detailed token, cost, latency, and model/provider breakdowns.

## What This App Does

- Parses one or more OpenClaw session JSONL files client-side.
- Normalizes each record into timeline events.
- Computes:
  - message counts
  - input/output/total tokens
  - estimated cost (from configurable model pricing)
  - duration and inter-message latency distribution
  - role/model/provider usage
- Visualizes everything in an interactive dashboard:
  - Overview charts
  - Timeline table with filtering/sorting/expanded raw JSON
  - Highlights panel
- Exports:
  - summary JSON
  - message-level CSV

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS + shadcn/ui + Radix UI
- Recharts

## Prerequisites

- Node.js 22+ (verified with `v22.21.1`)
- `pnpm` (or Corepack, which ships with Node 22)

If `pnpm` is not installed globally, use `corepack pnpm ...` commands below.

## Quick Start

### 1) Install dependencies

```powershell
corepack pnpm install
```

### 2) Run development server

```powershell
corepack pnpm dev
```

Open `http://localhost:3000`.

### 3) Production build

```powershell
corepack pnpm build
```

### 4) Run production server

```powershell
corepack pnpm start
```

If `3000` is already used, set `PORT`:

```powershell
$env:PORT=3200
corepack pnpm start
```

## Verified Run Status (Local Validation)

Validated in this workspace on **February 10, 2026**:

- `corepack pnpm install` succeeded.
- `corepack pnpm build` succeeded.
- `corepack pnpm dev --port 3100` served HTTP 200 and returned page content containing `OpenClaw`.
- Production start also served HTTP 200 when run with `PORT=3200`.

## Using the App

1. Upload one or more `.jsonl` files from the landing page.
2. Wait for parsing progress to complete.
3. In dashboard:
   - switch between combined and per-file views
   - adjust detected model pricing in the `Model Pricing` panel
   - explore `Overview`, `Timeline`, and `Highlights`
   - export summary JSON or message CSV

## Input Format Expectations

Parser behavior is implemented in `lib/parse-session-file.ts`.

- Input is newline-delimited JSON (`.jsonl`).
- Empty lines are skipped.
- Malformed JSON lines are ignored and added to warnings.
- Supported record patterns:
  - `type: "session"`
  - `type: "message"` with nested `message` payload
  - `type: "custom"`

For message records, the app extracts:

- `role`, `model`, `provider`
- token usage: `input`, `output`, `cacheRead`, `cacheCreation`, `totalTokens`
- raw cost (reference only, not used as final displayed estimate)
- text blocks from `message.content` where `type === "text"`

## Cost Model

Cost computation is implemented in `lib/compute-stats.ts`.

- Displayed estimated cost is recomputed from configured pricing map.
- Pricing units are dollars per 1M tokens.
- Estimated cost currently includes:
  - input tokens
  - output tokens
  - cache-read tokens
- Default model pricing is seeded from `lib/default-pricing.ts` and can be edited in the UI (`components/model-pricing-config.tsx`).

## Project Structure

```text
app/
  layout.tsx                # Root layout, theme provider
  page.tsx                  # Landing page + upload flow
  globals.css               # Global theme + custom styles

components/
  dashboard.tsx             # Main analytics dashboard
  upload-dropzone.tsx       # File upload UI
  parse-progress.tsx        # Parsing progress display
  summary-cards.tsx         # KPI cards
  charts.tsx                # Recharts visualizations
  timeline-table.tsx        # Search/sort/filter timeline table
  highlights.tsx            # Derived highlights
  model-pricing-config.tsx  # Per-model price editor
  export-buttons.tsx        # JSON/CSV downloads
  warnings-panel.tsx        # Parse warnings
  ui/*                      # shadcn/radix primitives

hooks/
  use-analysis.ts           # External-store hook

lib/
  analysis-store.ts         # Module-level shared app state
  parse-session-file.ts     # JSONL parsing + normalization
  compute-stats.ts          # Metrics/cost/latency aggregation
  default-pricing.ts        # Known model pricing defaults
  types.ts                  # Shared types
```

## Known Caveats

- `corepack pnpm lint` currently fails because the script uses `next lint` with Next 16 in this repo setup.
- TypeScript build errors are currently ignored by config (`next.config.mjs` sets `typescript.ignoreBuildErrors = true`).
- All processing is client-side in browser memory; very large files may impact responsiveness.

## Useful Commands

```powershell
# Install
corepack pnpm install

# Dev server
corepack pnpm dev

# Build
corepack pnpm build

# Start production
corepack pnpm start
```

