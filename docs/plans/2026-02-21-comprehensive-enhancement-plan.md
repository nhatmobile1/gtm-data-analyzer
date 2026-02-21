# GTM Data Analyzer — Comprehensive Enhancement Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enhance the GTM Data Analyzer across code quality, reliability, features, and persistence — structured as 4 independent layers, each producing a shippable improvement.

**Architecture:** Layered enhancement approach. Layer 1 cleans code, Layer 2 adds testing + error handling, Layer 3 fills feature gaps + accessibility, Layer 4 adds Postgres persistence. Each layer builds on the previous but is independently deployable.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS v4, Recharts, PapaParse, Vitest (new), Drizzle ORM (Layer 4), Neon Postgres (Layer 4)

---

## Layer 1: Quick Wins

### Task 1: Create constants file

**Files:**
- Create: `lib/constants.ts`

**Step 1: Create the constants file**

```typescript
// lib/constants.ts

// Column detection
export const DIMENSION_MIN_UNIQUE = 2;
export const DIMENSION_MAX_UNIQUE = 40;
export const COLUMN_SAMPLE_SIZE = 100;

// Variance analysis
export const MIN_TOUCHES_THRESHOLD = 20;
export const VARIANCE_STRONG = 3;
export const VARIANCE_MODERATE = 1.5;

// Drop-off recovery
export const RECOVERY_RATE = 0.1;

// Concentration risk
export const CONCENTRATION_RISK_THRESHOLD = 0.5;

// Metric color thresholds
export const MEETING_RATE_GREEN = 15;
export const MEETING_RATE_RED = 5;
export const PIPELINE_PER_TOUCH_GREEN = 10000;
export const PIPELINE_PER_TOUCH_RED = 2000;
export const MTG_TO_OPP_GREEN = 70;
export const MTG_TO_OPP_RED = 50;

// Dashboard limits
export const MAX_DASHBOARDS = 10;
export const MAX_AI_MESSAGES = 40;
export const MAX_API_MESSAGES = 50;
export const MAX_CONTEXT_LENGTH = 200_000;
```

**Step 2: Commit**

```bash
git add lib/constants.ts
git commit -m "feat: extract business logic constants into lib/constants.ts"
```

---

### Task 2: Wire constants into existing code

**Files:**
- Modify: `lib/analysis.ts:156` (MIN_TOUCHES_THRESHOLD, VARIANCE_STRONG, VARIANCE_MODERATE)
- Modify: `lib/columnDetection.ts:107` (DIMENSION_MIN_UNIQUE, DIMENSION_MAX_UNIQUE)
- Modify: `lib/formatting.ts:24-40` (MEETING_RATE_GREEN/RED, PIPELINE_PER_TOUCH_GREEN/RED, MTG_TO_OPP_GREEN/RED)
- Modify: `hooks/useAnalysis.ts:75` (COLUMN_SAMPLE_SIZE)
- Modify: `hooks/useAIChat.ts:6` (MAX_AI_MESSAGES)
- Modify: `hooks/useDashboardStore.ts:12` (MAX_DASHBOARDS)
- Modify: `app/api/analyze/route.ts:5-6` (MAX_CONTEXT_LENGTH, MAX_API_MESSAGES)
- Modify: `components/analysis/DropOffAnalysis.tsx:31` (RECOVERY_RATE)

**Step 1: Update `lib/analysis.ts`**

Replace:
```typescript
export function calculateVariance(
  crossCutResults: FunnelRow[],
  minTouches: number = 20
): VarianceResult | null {
```
With:
```typescript
import { MIN_TOUCHES_THRESHOLD, VARIANCE_STRONG, VARIANCE_MODERATE } from "./constants";

export function calculateVariance(
  crossCutResults: FunnelRow[],
  minTouches: number = MIN_TOUCHES_THRESHOLD
): VarianceResult | null {
```

Replace:
```typescript
  if (ratio >= 3) signal = "strong";
  else if (ratio >= 1.5) signal = "moderate";
```
With:
```typescript
  if (ratio >= VARIANCE_STRONG) signal = "strong";
  else if (ratio >= VARIANCE_MODERATE) signal = "moderate";
```

**Step 2: Update `lib/columnDetection.ts`**

Add import at top:
```typescript
import { DIMENSION_MIN_UNIQUE, DIMENSION_MAX_UNIQUE } from "./constants";
```

Replace line 107:
```typescript
    if (!isNumeric && unique.size >= 2 && unique.size <= 40 && vals.length > 0) {
```
With:
```typescript
    if (!isNumeric && unique.size >= DIMENSION_MIN_UNIQUE && unique.size <= DIMENSION_MAX_UNIQUE && vals.length > 0) {
```

**Step 3: Update `lib/formatting.ts`**

Add import at top:
```typescript
import {
  MEETING_RATE_GREEN, MEETING_RATE_RED,
  PIPELINE_PER_TOUCH_GREEN, PIPELINE_PER_TOUCH_RED,
  MTG_TO_OPP_GREEN, MTG_TO_OPP_RED,
} from "./constants";
```

Replace the three color functions:
```typescript
export function meetingRateColor(rate: number): string {
  if (rate > MEETING_RATE_GREEN) return "text-positive";
  if (rate < MEETING_RATE_RED) return "text-negative";
  return "text-text";
}

export function pipelinePerTouchColor(ppt: number): string {
  if (ppt > PIPELINE_PER_TOUCH_GREEN) return "text-positive";
  if (ppt < PIPELINE_PER_TOUCH_RED) return "text-negative";
  return "text-text";
}

export function mtgToOppColor(rate: number): string {
  if (rate > MTG_TO_OPP_GREEN) return "text-positive";
  if (rate < MTG_TO_OPP_RED) return "text-negative";
  return "text-text";
}
```

**Step 4: Update remaining files**

In `hooks/useAnalysis.ts:75`, replace `data.slice(0, 100)` with:
```typescript
import { COLUMN_SAMPLE_SIZE } from "@/lib/constants";
// ...
const detected = detectColumns(hdrs, data.slice(0, COLUMN_SAMPLE_SIZE));
```

In `hooks/useAIChat.ts:6`, replace `const MAX_MESSAGES = 40;` with:
```typescript
import { MAX_AI_MESSAGES } from "@/lib/constants";
```
And update the usage at line 50 from `MAX_MESSAGES` to `MAX_AI_MESSAGES`.

In `hooks/useDashboardStore.ts:12`, replace `const MAX_DASHBOARDS = 10;` with:
```typescript
import { MAX_DASHBOARDS } from "@/lib/constants";
```
And remove the local constant.

In `app/api/analyze/route.ts:5-6`, replace the two constants with:
```typescript
import { MAX_CONTEXT_LENGTH, MAX_API_MESSAGES } from "@/lib/constants";
```
And rename `MAX_MESSAGES` usage to `MAX_API_MESSAGES` at line 32.

In `components/analysis/DropOffAnalysis.tsx:31`, replace `0.1` with:
```typescript
import { RECOVERY_RATE } from "@/lib/constants";
// ...
? Math.round(dropOff.noMeeting * RECOVERY_RATE) *
```

**Step 5: Verify build passes**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 6: Commit**

```bash
git add lib/constants.ts lib/analysis.ts lib/columnDetection.ts lib/formatting.ts hooks/useAnalysis.ts hooks/useAIChat.ts hooks/useDashboardStore.ts app/api/analyze/route.ts components/analysis/DropOffAnalysis.tsx
git commit -m "refactor: replace magic numbers with named constants from lib/constants.ts"
```

---

### Task 3: Create shared chart theme

**Files:**
- Create: `lib/chartTheme.ts`
- Modify: `components/analysis/Charts.tsx:24-69`
- Modify: `components/analysis/CrossCutExplorer.tsx:31-36`

**Step 1: Create `lib/chartTheme.ts`**

```typescript
// lib/chartTheme.ts
// Shared chart colors and styles — single source of truth for Recharts theming.
// These match the CSS custom properties in globals.css.

export const CHART_COLORS = {
  accent: "#58a6ff",
  accentDark: "#1f6feb",
  positive: "#3fb950",
  negative: "#f85149",
  warning: "#d29922",
  muted: "#30363d",
  nurture: "#bc8cff",
  text: "#e6edf3",
  textMuted: "#8b949e",
  grid: "#21262d",
  surface: "#161b22",
  border: "#30363d",
} as const;

export const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: CHART_COLORS.surface,
    border: `1px solid ${CHART_COLORS.border}`,
    borderRadius: 6,
    fontSize: 12,
    color: CHART_COLORS.text,
  },
  labelStyle: { color: CHART_COLORS.text },
  itemStyle: { color: CHART_COLORS.text },
} as const;

export const CURSOR_STYLE = { fill: "rgba(88, 166, 255, 0.06)" } as const;

export const X_AXIS_PROPS = {
  tick: { fill: CHART_COLORS.textMuted, fontSize: 10 },
  axisLine: { stroke: CHART_COLORS.grid },
  tickLine: false,
  interval: 0 as const,
} as const;

export const Y_AXIS_TICK = {
  fill: CHART_COLORS.textMuted,
  fontSize: 10,
} as const;

export const LEGEND_STYLE = {
  fontSize: 11,
  color: CHART_COLORS.textMuted,
  paddingBottom: 8,
} as const;
```

**Step 2: Update `Charts.tsx`**

Replace the local `CHART_COLORS`, `tooltipStyle`, and `xAxisProps` with imports from `@/lib/chartTheme`:

```typescript
import { CHART_COLORS, TOOLTIP_STYLE, CURSOR_STYLE, X_AXIS_PROPS, Y_AXIS_TICK, LEGEND_STYLE } from "@/lib/chartTheme";
```

Remove the local `CHART_COLORS` (lines 24-35), `tooltipStyle` (lines 55-69), and `xAxisProps` (lines 71-76).

Update all `{...tooltipStyle}` to `{...TOOLTIP_STYLE}`, all `cursor={{ fill: "rgba(88, 166, 255, 0.06)" }}` to `cursor={CURSOR_STYLE}`, all `{...xAxisProps}` to `{...X_AXIS_PROPS}`, all `tick={{ fill: CHART_COLORS.textMuted, fontSize: 10 }}` on YAxis to `tick={Y_AXIS_TICK}`, and all `wrapperStyle={{ fontSize: 11, color: CHART_COLORS.textMuted, paddingBottom: 8 }}` to `wrapperStyle={LEGEND_STYLE}`.

**Step 3: Update `CrossCutExplorer.tsx`**

Replace the local `CHART_COLORS` (lines 31-36) with:
```typescript
import { CHART_COLORS, TOOLTIP_STYLE, CURSOR_STYLE, LEGEND_STYLE } from "@/lib/chartTheme";
```

Update the inline tooltip `contentStyle` (lines 195-201) to `{...TOOLTIP_STYLE}`.

**Step 4: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add lib/chartTheme.ts components/analysis/Charts.tsx components/analysis/CrossCutExplorer.tsx
git commit -m "refactor: consolidate duplicated chart colors into shared lib/chartTheme.ts"
```

---

### Task 4: Fix inline styles and arbitrary Tailwind values

**Files:**
- Modify: `components/ui/EditableName.tsx` (inline color styles)
- Modify: `components/Dashboard.tsx:61` (bg-[#21262d])
- Modify: `components/ai/AIAnalyst.tsx:146,228,238` (bg-[#21262d], bg-[#1f6feb])

**Step 1: Fix `EditableName.tsx`**

Replace all `style={{ color: "#e6edf3" }}` with Tailwind class `text-text`. Remove the `style` prop entirely and ensure `className` includes `text-text`.

**Step 2: Fix arbitrary color values across components**

Replace `bg-[#21262d]` with `bg-surface-hover` or a new Tailwind token.

Since `#21262d` is between `surface` (#161b22) and `border` (#30363d), and is used for disabled/inactive button backgrounds, add a new CSS variable to `globals.css`:

```css
--color-surface-alt: #21262d;
```

Then replace all `bg-[#21262d]` with `bg-surface-alt`.

Replace `bg-[#1f6feb]` with a new token:
```css
--color-accent-dark: #1f6feb;
```
Then replace all `bg-[#1f6feb]` with `bg-accent-dark`.

**Step 3: Verify build passes**

Run: `npm run build`

**Step 4: Commit**

```bash
git add app/globals.css components/ui/EditableName.tsx components/Dashboard.tsx components/ai/AIAnalyst.tsx
git commit -m "refactor: replace inline styles and arbitrary Tailwind values with design tokens"
```

---

### Task 5: Remove dead code and fix division-by-zero

**Files:**
- Modify: `hooks/useAnalysis.ts:87-100` (remove `loadCSV`)
- Modify: `lib/dataContext.ts:56` (division-by-zero guard)

**Step 1: Remove `loadCSV` from `useAnalysis.ts`**

Delete lines 87-100 (the entire `loadCSV` callback). Also remove it from the return object at line 145.

**Step 2: Fix division-by-zero in `dataContext.ts`**

Replace line 56:
```typescript
${totals.touches.toLocaleString()} touches → ${totals.meetings.toLocaleString()} meetings (${((totals.meetings / totals.touches) * 100).toFixed(1)}%) → ${totals.opps.toLocaleString()} opportunities (${((totals.opps / totals.meetings) * 100).toFixed(1)}% mtg→opp) → $${Math.round(totals.pipeline).toLocaleString()} pipeline → $${Math.round(totals.closedWon).toLocaleString()} closed won
```
With:
```typescript
${totals.touches.toLocaleString()} touches → ${totals.meetings.toLocaleString()} meetings (${totals.touches > 0 ? ((totals.meetings / totals.touches) * 100).toFixed(1) : "0.0"}%) → ${totals.opps.toLocaleString()} opportunities (${totals.meetings > 0 ? ((totals.opps / totals.meetings) * 100).toFixed(1) : "0.0"}% mtg→opp) → $${Math.round(totals.pipeline).toLocaleString()} pipeline → $${Math.round(totals.closedWon).toLocaleString()} closed won
```

**Step 3: Verify build passes**

Run: `npm run build`

**Step 4: Commit**

```bash
git add hooks/useAnalysis.ts lib/dataContext.ts
git commit -m "fix: remove dead loadCSV export and guard against division-by-zero in dataContext"
```

---

### Task 6: Refactor buildDataContext to avoid redundant computation

**Files:**
- Modify: `lib/dataContext.ts:1-14` (accept pre-computed channel funnel)
- Modify: `hooks/useAnalysis.ts:66-69` (pass channel funnel to buildDataContext)

**Step 1: Update `buildDataContext` signature**

The function currently calls `analyzeFunnel(rawData, columns, columns.channel)` even though a channel funnel may already be computed. Refactor to remove the redundant call:

Replace lines 11-14:
```typescript
  // Channel funnel table
  const channelFunnel = columns.channel
    ? analyzeFunnel(rawData, columns, columns.channel)
    : funnel;
```
With:
```typescript
  // Use the passed-in funnel directly (already computed and memoized by useAnalysis)
  const channelFunnel = funnel;
```

Note: The `funnel` passed in is already grouped by the selected dimension. If `selectedDim` is not the channel, we lose the channel-specific funnel. However, the current behavior already has this issue since the `funnel` param is based on `selectedDim`. To keep the AI context always channel-based, we should pass a separate `channelFunnel` parameter.

Better approach — add a `channelFunnel` parameter:

```typescript
export function buildDataContext(
  rawData: CsvRow[],
  columns: DetectedColumns,
  channelFunnel: FunnelRow[],
  totals: Totals,
  dropOff: DropOffResult | null
): string {
  const channelTable = channelFunnel
    .map(/* ... existing formatter ... */)
    .join("\n");
```

Then in `useAnalysis.ts`, add a memoized channel funnel:
```typescript
const channelFunnel: FunnelRow[] = useMemo(() => {
  if (!rawData || !columns || !columns.channel) return funnel;
  if (selectedDim === columns.channel) return funnel;
  return analyzeFunnel(rawData, columns, columns.channel);
}, [rawData, columns, selectedDim, funnel]);
```

And update the `dataContext` memo:
```typescript
const dataContext: string = useMemo(() => {
  if (!rawData || !columns || !channelFunnel.length || !totals) return "";
  return buildDataContext(rawData, columns, channelFunnel, totals, dropOff);
}, [rawData, columns, channelFunnel, totals, dropOff]);
```

**Step 2: Verify build passes**

Run: `npm run build`

**Step 3: Commit**

```bash
git add lib/dataContext.ts hooks/useAnalysis.ts
git commit -m "refactor: eliminate redundant analyzeFunnel calls in buildDataContext"
```

---

### Task 7: Fix Anthropic client initialization and documentation

**Files:**
- Modify: `app/api/analyze/route.ts:1-3` (move client into handler)
- Create: `.env.example`
- Modify: `CLAUDE.md` (fix Next.js version)

**Step 1: Fix Anthropic client initialization**

Replace lines 1-3 of `app/api/analyze/route.ts`:
```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();
```
With:
```typescript
import Anthropic from "@anthropic-ai/sdk";
```

Then inside the `POST` handler, before the stream creation (after validation), add:
```typescript
    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured. Set it in .env.local." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const client = new Anthropic();
```

**Step 2: Create `.env.example`**

```
# Required for AI Analyst feature
ANTHROPIC_API_KEY=sk-ant-...
```

**Step 3: Fix CLAUDE.md version references**

Update `CLAUDE.md` to say Next.js 16 instead of 14 in the Tech Stack table and anywhere else it says 14.

**Step 4: Commit**

```bash
git add app/api/analyze/route.ts .env.example CLAUDE.md
git commit -m "fix: guard Anthropic client init, add .env.example, fix Next.js version in docs"
```

---

## Layer 2: Reliability

### Task 8: Set up Vitest testing infrastructure

**Files:**
- Modify: `package.json` (add dev dependencies and scripts)
- Create: `vitest.config.ts`

**Step 1: Install Vitest and testing libraries**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Step 2: Create `vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

**Step 3: Add scripts to `package.json`**

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage",
"typecheck": "tsc --noEmit"
```

**Step 4: Verify test runner works**

Run: `npx vitest run`
Expected: "No test files found" (not an error — just means no tests yet)

**Step 5: Commit**

```bash
git add package.json vitest.config.ts package-lock.json
git commit -m "chore: set up Vitest testing infrastructure with jsdom environment"
```

---

### Task 9: Unit tests for `lib/formatting.ts`

**Files:**
- Create: `lib/__tests__/formatting.test.ts`

**Step 1: Write the tests**

```typescript
import { describe, it, expect } from "vitest";
import { formatCurrency, formatNumber, formatPercent, pct, meetingRateColor, pipelinePerTouchColor, mtgToOppColor } from "../formatting";

describe("formatCurrency", () => {
  it("returns em dash for null/undefined/NaN", () => {
    expect(formatCurrency(null)).toBe("\u2014");
    expect(formatCurrency(undefined)).toBe("\u2014");
    expect(formatCurrency(NaN)).toBe("\u2014");
  });

  it("formats millions", () => {
    expect(formatCurrency(1_500_000)).toBe("$1.5M");
    expect(formatCurrency(-2_300_000)).toBe("$-2.3M");
  });

  it("formats thousands", () => {
    expect(formatCurrency(50_000)).toBe("$50K");
    expect(formatCurrency(10_000)).toBe("$10K");
  });

  it("formats values between 1000 and 10000", () => {
    const result = formatCurrency(5_432);
    expect(result).toMatch(/^\$5,432$/);
  });

  it("formats small values", () => {
    expect(formatCurrency(500)).toBe("$500");
    expect(formatCurrency(0)).toBe("$0");
  });
});

describe("formatNumber", () => {
  it("returns em dash for null/undefined", () => {
    expect(formatNumber(null)).toBe("\u2014");
    expect(formatNumber(undefined)).toBe("\u2014");
  });

  it("formats with locale separators", () => {
    expect(formatNumber(1234)).toBe("1,234");
    expect(formatNumber(0)).toBe("0");
  });
});

describe("formatPercent", () => {
  it("returns em dash for null/undefined/NaN", () => {
    expect(formatPercent(null)).toBe("\u2014");
    expect(formatPercent(NaN)).toBe("\u2014");
  });

  it("formats with one decimal", () => {
    expect(formatPercent(15.67)).toBe("15.7%");
    expect(formatPercent(0)).toBe("0.0%");
  });
});

describe("pct", () => {
  it("returns percentage", () => {
    expect(pct(1, 4)).toBe(25);
  });

  it("returns 0 for zero denominator", () => {
    expect(pct(5, 0)).toBe(0);
  });
});

describe("meetingRateColor", () => {
  it("returns positive for rates above 15", () => {
    expect(meetingRateColor(20)).toBe("text-positive");
  });

  it("returns negative for rates below 5", () => {
    expect(meetingRateColor(3)).toBe("text-negative");
  });

  it("returns neutral for rates in between", () => {
    expect(meetingRateColor(10)).toBe("text-text");
  });
});

describe("pipelinePerTouchColor", () => {
  it("returns positive for high efficiency", () => {
    expect(pipelinePerTouchColor(15000)).toBe("text-positive");
  });

  it("returns negative for low efficiency", () => {
    expect(pipelinePerTouchColor(1000)).toBe("text-negative");
  });
});

describe("mtgToOppColor", () => {
  it("returns positive for high conversion", () => {
    expect(mtgToOppColor(80)).toBe("text-positive");
  });

  it("returns negative for low conversion", () => {
    expect(mtgToOppColor(40)).toBe("text-negative");
  });
});
```

**Step 2: Run tests**

Run: `npx vitest run lib/__tests__/formatting.test.ts`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add lib/__tests__/formatting.test.ts
git commit -m "test: add unit tests for lib/formatting.ts"
```

---

### Task 10: Unit tests for `lib/analysis.ts`

**Files:**
- Create: `lib/__tests__/analysis.test.ts`

**Step 1: Write the tests**

```typescript
import { describe, it, expect } from "vitest";
import { analyzeFunnel, analyzeDropOff, calculateVariance, calculateTotals } from "../analysis";
import type { DetectedColumns, CsvRow, FunnelRow } from "../types";

function makeCols(overrides: Partial<DetectedColumns> = {}): DetectedColumns {
  return {
    id: "id",
    contactId: null,
    channel: "channel",
    campaign: null,
    meetingBooked: "meeting_booked",
    oppId: "opp_id",
    pipeline: "pipeline",
    closedWon: "closed_won",
    oppStage: "opp_stage",
    interactionStatus: "status",
    dimensions: [],
    ...overrides,
  };
}

function makeRow(overrides: Record<string, string> = {}): CsvRow {
  return {
    id: "1",
    channel: "Email",
    meeting_booked: "No",
    opp_id: "",
    pipeline: "0",
    closed_won: "0",
    opp_stage: "",
    status: "",
    ...overrides,
  };
}

describe("analyzeFunnel", () => {
  it("groups by dimension and calculates touches", () => {
    const data: CsvRow[] = [
      makeRow({ channel: "Email" }),
      makeRow({ channel: "Email" }),
      makeRow({ channel: "Events" }),
    ];
    const cols = makeCols();
    const result = analyzeFunnel(data, cols, "channel");

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Email");
    expect(result[0].touches).toBe(2);
    expect(result[1].name).toBe("Events");
    expect(result[1].touches).toBe(1);
  });

  it("calculates meeting rate correctly", () => {
    const data: CsvRow[] = [
      makeRow({ channel: "Email", meeting_booked: "Yes" }),
      makeRow({ channel: "Email", meeting_booked: "No" }),
      makeRow({ channel: "Email", meeting_booked: "Yes" }),
      makeRow({ channel: "Email", meeting_booked: "No" }),
    ];
    const cols = makeCols();
    const result = analyzeFunnel(data, cols, "channel");

    expect(result[0].meetings).toBe(2);
    expect(result[0].mtgRate).toBe(50);
  });

  it("sorts by pipeline descending", () => {
    const data: CsvRow[] = [
      makeRow({ channel: "Email", pipeline: "1000" }),
      makeRow({ channel: "Events", pipeline: "5000" }),
    ];
    const cols = makeCols();
    const result = analyzeFunnel(data, cols, "channel");

    expect(result[0].name).toBe("Events");
    expect(result[0].pipeline).toBe(5000);
    expect(result[1].name).toBe("Email");
  });

  it("handles empty data", () => {
    const result = analyzeFunnel([], makeCols(), "channel");
    expect(result).toEqual([]);
  });

  it("uses (blank) for missing dimension values", () => {
    const data: CsvRow[] = [makeRow({ channel: "" })];
    const cols = makeCols();
    const result = analyzeFunnel(data, cols, "channel");

    expect(result[0].name).toBe("(blank)");
  });

  it("calculates pipeline share correctly", () => {
    const data: CsvRow[] = [
      makeRow({ channel: "A", pipeline: "300" }),
      makeRow({ channel: "B", pipeline: "700" }),
    ];
    const result = analyzeFunnel(data, makeCols(), "channel");

    expect(result[0].pipelineShare).toBe(70); // B has 700/1000
    expect(result[1].pipelineShare).toBe(30);
  });
});

describe("analyzeDropOff", () => {
  it("returns null if no interactionStatus column", () => {
    const cols = makeCols({ interactionStatus: null });
    const result = analyzeDropOff([], cols);
    expect(result).toBeNull();
  });

  it("returns null if no meetingBooked column", () => {
    const cols = makeCols({ meetingBooked: null });
    const result = analyzeDropOff([], cols);
    expect(result).toBeNull();
  });

  it("counts attended contacts without meetings", () => {
    const data: CsvRow[] = [
      makeRow({ status: "Attended", meeting_booked: "No" }),
      makeRow({ status: "Attended", meeting_booked: "Yes" }),
      makeRow({ status: "Visited Booth", meeting_booked: "No" }),
      makeRow({ status: "Registered", meeting_booked: "No" }),
    ];
    const cols = makeCols();
    const result = analyzeDropOff(data, cols);

    expect(result).not.toBeNull();
    expect(result!.attended).toBe(3); // Attended x2 + Visited
    expect(result!.noMeeting).toBe(2); // Attended No + Visited No
  });
});

describe("calculateVariance", () => {
  it("returns STRONG for 3x+ gap", () => {
    const rows: FunnelRow[] = [
      { name: "A", touches: 100, pipelinePerTouch: 9000 } as FunnelRow,
      { name: "B", touches: 50, pipelinePerTouch: 3000 } as FunnelRow,
    ];
    const result = calculateVariance(rows);

    expect(result).not.toBeNull();
    expect(result!.signal).toBe("strong");
    expect(result!.ratio).toBe(3);
  });

  it("returns MODERATE for 1.5x-3x gap", () => {
    const rows: FunnelRow[] = [
      { name: "A", touches: 100, pipelinePerTouch: 2000 } as FunnelRow,
      { name: "B", touches: 50, pipelinePerTouch: 1000 } as FunnelRow,
    ];
    const result = calculateVariance(rows);

    expect(result).not.toBeNull();
    expect(result!.signal).toBe("moderate");
  });

  it("returns LOW for <1.5x gap", () => {
    const rows: FunnelRow[] = [
      { name: "A", touches: 100, pipelinePerTouch: 1200 } as FunnelRow,
      { name: "B", touches: 50, pipelinePerTouch: 1000 } as FunnelRow,
    ];
    const result = calculateVariance(rows);

    expect(result).not.toBeNull();
    expect(result!.signal).toBe("low");
  });

  it("filters out segments below minTouches", () => {
    const rows: FunnelRow[] = [
      { name: "Big", touches: 100, pipelinePerTouch: 9000 } as FunnelRow,
      { name: "Tiny", touches: 5, pipelinePerTouch: 1 } as FunnelRow,
    ];
    const result = calculateVariance(rows);

    // Only one qualifying segment, need at least 2
    expect(result).toBeNull();
  });

  it("returns null for fewer than 2 qualifying segments", () => {
    const rows: FunnelRow[] = [
      { name: "A", touches: 100, pipelinePerTouch: 5000 } as FunnelRow,
    ];
    expect(calculateVariance(rows)).toBeNull();
  });

  it("handles all-zero pipelinePerTouch", () => {
    const rows: FunnelRow[] = [
      { name: "A", touches: 100, pipelinePerTouch: 0 } as FunnelRow,
      { name: "B", touches: 50, pipelinePerTouch: 0 } as FunnelRow,
    ];
    expect(calculateVariance(rows)).toBeNull();
  });
});

describe("calculateTotals", () => {
  it("sums all funnel row fields", () => {
    const rows: FunnelRow[] = [
      { touches: 100, meetings: 10, opps: 5, pipeline: 50000, closedWon: 20000 } as FunnelRow,
      { touches: 200, meetings: 20, opps: 8, pipeline: 80000, closedWon: 30000 } as FunnelRow,
    ];
    const totals = calculateTotals(rows);

    expect(totals.touches).toBe(300);
    expect(totals.meetings).toBe(30);
    expect(totals.opps).toBe(13);
    expect(totals.pipeline).toBe(130000);
    expect(totals.closedWon).toBe(50000);
  });
});
```

**Step 2: Run tests**

Run: `npx vitest run lib/__tests__/analysis.test.ts`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add lib/__tests__/analysis.test.ts
git commit -m "test: add unit tests for lib/analysis.ts (funnel, drop-off, variance, totals)"
```

---

### Task 11: Unit tests for `lib/columnDetection.ts`

**Files:**
- Create: `lib/__tests__/columnDetection.test.ts`

**Step 1: Write the tests**

```typescript
import { describe, it, expect } from "vitest";
import { detectColumns } from "../columnDetection";
import type { CsvRow } from "../types";

function makeSample(overrides: Record<string, string> = {}): CsvRow {
  return {
    "Campaign Member ID": "CM001",
    "Contact ID": "C001",
    Channel: "Email",
    "Campaign Name": "Q1 Nurture",
    "Meeting Booked": "No",
    "Opportunity ID": "",
    "Pipeline Revenue Share": "0",
    "Closed Won Revenue": "0",
    "Opportunity Stage": "",
    "Interaction Status": "Registered",
    "Account Tier": "Enterprise",
    ...overrides,
  };
}

describe("detectColumns", () => {
  const headers = [
    "Campaign Member ID", "Contact ID", "Channel", "Campaign Name",
    "Meeting Booked", "Opportunity ID", "Pipeline Revenue Share",
    "Closed Won Revenue", "Opportunity Stage", "Interaction Status",
    "Account Tier",
  ];
  const samples = [makeSample(), makeSample({ "Meeting Booked": "Yes" })];

  it("detects all standard column roles", () => {
    const result = detectColumns(headers, samples);

    expect(result.id).toBe("Campaign Member ID");
    expect(result.contactId).toBe("Contact ID");
    expect(result.channel).toBe("Channel");
    expect(result.campaign).toBe("Campaign Name");
    expect(result.meetingBooked).toBe("Meeting Booked");
    expect(result.oppId).toBe("Opportunity ID");
    expect(result.pipeline).toBe("Pipeline Revenue Share");
    expect(result.closedWon).toBe("Closed Won Revenue");
    expect(result.oppStage).toBe("Opportunity Stage");
    expect(result.interactionStatus).toBe("Interaction Status");
  });

  it("detects categorical columns as dimensions", () => {
    const manySamples = Array.from({ length: 10 }, (_, i) =>
      makeSample({ "Account Tier": i < 5 ? "Enterprise" : "Mid-Market" })
    );
    const result = detectColumns(headers, manySamples);
    expect(result.dimensions).toContain("Account Tier");
  });

  it("excludes numeric columns from dimensions", () => {
    const numHeaders = ["id", "Score"];
    const numSamples = [
      { id: "1", Score: "95" },
      { id: "2", Score: "87" },
    ];
    const result = detectColumns(numHeaders, numSamples);
    expect(result.dimensions).not.toContain("Score");
  });

  it("excludes columns with too many unique values from dimensions", () => {
    const uniqueHeaders = ["id", "Description"];
    const uniqueSamples = Array.from({ length: 50 }, (_, i) => ({
      id: String(i),
      Description: `Unique description ${i}`,
    }));
    const result = detectColumns(uniqueHeaders, uniqueSamples);
    expect(result.dimensions).not.toContain("Description");
  });

  it("handles empty headers", () => {
    const result = detectColumns([], []);
    expect(result.channel).toBeNull();
    expect(result.dimensions).toEqual([]);
  });
});
```

**Step 2: Run tests**

Run: `npx vitest run lib/__tests__/columnDetection.test.ts`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add lib/__tests__/columnDetection.test.ts
git commit -m "test: add unit tests for lib/columnDetection.ts"
```

---

### Task 12: Add CSV error handling

**Files:**
- Modify: `hooks/useAnalysis.ts` (add error state, handle PapaParse errors)
- Modify: `components/upload/FileUpload.tsx` (file size + type validation)
- Modify: `app/page.tsx` (FileReader error handler, pass error state)

**Step 1: Add error state to `useAnalysis`**

Add to the hook:
```typescript
const [error, setError] = useState<string | null>(null);
```

In `loadCSVText`, after parsing, check for errors:
```typescript
const result = Papa.parse<CsvRow>(csvText, {
  header: true,
  skipEmptyLines: true,
});

if (result.errors.length > 0 && result.data.length === 0) {
  setError(`CSV parsing failed: ${result.errors[0].message}`);
  setParsing(false);
  return;
}

if (result.data.length === 0 || !result.meta.fields?.length) {
  setError("CSV file appears to be empty or has no headers.");
  setParsing(false);
  return;
}

setError(null);
applyParsed(name, result.data, result.meta.fields || []);
```

Add `error` and `setError` to the return object. Also clear error in `reset()`.

**Step 2: Add file validation to `FileUpload.tsx`**

Add a max file size constant (10MB):
```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
```

In `handleDrop`, add size validation:
```typescript
if (file.size > MAX_FILE_SIZE) {
  // show error
  return;
}
```

Add an `error` state to `FileUpload` and display it below the upload zone when set.

Also update the input file handling in `handleInputChange` to check size.

Show a user-visible error for non-CSV files dropped.

**Step 3: Add FileReader error handler in `page.tsx`**

```typescript
reader.onerror = () => {
  analysis.setError?.("Failed to read the file. Please try again.");
};
```

**Step 4: Display error in the UI**

In `page.tsx`, if `analysis.error` is set, show an error banner above the upload zone or dashboard.

**Step 5: Verify build passes**

Run: `npm run build`

**Step 6: Commit**

```bash
git add hooks/useAnalysis.ts components/upload/FileUpload.tsx app/page.tsx
git commit -m "feat: add CSV error handling — file size validation, parse error surfacing"
```

---

### Task 13: Add confirmation dialogs

**Files:**
- Create: `components/ui/ConfirmDialog.tsx`
- Modify: `components/upload/DashboardBrowser.tsx` (wrap "Clear all" and delete with confirmation)
- Modify: `components/upload/DashboardRow.tsx` (wrap delete with confirmation)

**Step 1: Create `ConfirmDialog.tsx`**

```typescript
"use client";

import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      className="bg-surface border border-border rounded-lg p-5 max-w-sm w-full text-text backdrop:bg-black/50"
      onClose={onCancel}
    >
      <div className="font-semibold text-sm mb-2">{title}</div>
      <p className="text-muted text-xs mb-4">{message}</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="py-1.5 px-3 rounded-md text-xs border border-border text-muted hover:text-text transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="py-1.5 px-3 rounded-md text-xs bg-negative text-white hover:bg-negative/80 transition-colors"
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
```

**Step 2: Add confirmation to "Clear all" in `DashboardBrowser.tsx`**

Add state:
```typescript
const [showClearConfirm, setShowClearConfirm] = useState(false);
```

Replace the direct `onClearAll()` call with `setShowClearConfirm(true)`, and render `<ConfirmDialog>` with `onConfirm={() => { onClearAll(); setShowClearConfirm(false); }}`.

**Step 3: Add confirmation to dashboard delete in `DashboardRow.tsx`**

Same pattern — `showDeleteConfirm` state, wrap the delete action.

**Step 4: Verify build passes**

Run: `npm run build`

**Step 5: Commit**

```bash
git add components/ui/ConfirmDialog.tsx components/upload/DashboardBrowser.tsx components/upload/DashboardRow.tsx
git commit -m "feat: add confirmation dialogs for destructive actions (clear all, delete dashboard)"
```

---

### Task 14: Add localStorage safety notifications

**Files:**
- Modify: `hooks/useDashboardStore.ts` (return notification state)

**Step 1: Add notification callback to `saveToStorage`**

Add a `notifications` state array to the hook:
```typescript
const [notifications, setNotifications] = useState<string[]>([]);
```

When quota is exceeded and a dashboard is dropped, add a notification:
```typescript
setNotifications(prev => [...prev, "Storage full — oldest dashboard was removed to make room."]);
```

When the dashboard cap is reached in `saveDashboard`, add:
```typescript
if (prev.dashboards.length >= MAX_DASHBOARDS) {
  setNotifications(prev => [...prev, `Maximum of ${MAX_DASHBOARDS} dashboards reached. Oldest was replaced.`]);
}
```

Return `notifications` and a `clearNotifications` function from the hook.

**Step 2: Display notifications in `page.tsx`**

Render notifications as a toast/banner above the upload area.

**Step 3: Commit**

```bash
git add hooks/useDashboardStore.ts app/page.tsx
git commit -m "feat: notify user when dashboard is dropped due to storage limits"
```

---

## Layer 3: Feature Gaps & Accessibility

### Task 15: Make Field Mapping editable

**Files:**
- Modify: `components/analysis/FieldMapping.tsx` (add dropdowns for each role)
- Modify: `hooks/useAnalysis.ts` (add `updateColumns` method)
- Modify: `components/Dashboard.tsx` (pass updateColumns to FieldMapping)

**Step 1: Add `updateColumns` to `useAnalysis`**

```typescript
const updateColumns = useCallback((newColumns: DetectedColumns) => {
  setColumns(newColumns);
  // Re-select default dimensions if needed
  if (newColumns.channel && !newColumns.dimensions.includes(selectedDim || "")) {
    setSelectedDim(newColumns.channel);
  }
  if (!newColumns.dimensions.includes(crossCutDim || "")) {
    setCrossCutDim(newColumns.dimensions[0] || null);
  }
}, [selectedDim, crossCutDim]);
```

Add to return object.

**Step 2: Update FieldMapping to be interactive**

Add `headers` and `onColumnsChange` props. For each role, render a `<select>` dropdown populated with `["(none)", ...headers]`. When a dropdown changes, build a new `DetectedColumns` object and call `onColumnsChange`.

Add a "Reset to Auto-Detected" button that re-runs `detectColumns` with the original headers and sample data.

**Step 3: Wire it up in `Dashboard.tsx`**

Pass `analysis.headers`, `analysis.updateColumns` to `FieldMapping`.

**Step 4: Verify build passes**

Run: `npm run build`

**Step 5: Commit**

```bash
git add components/analysis/FieldMapping.tsx hooks/useAnalysis.ts components/Dashboard.tsx
git commit -m "feat: make Field Mapping tab interactive — users can override column detection"
```

---

### Task 16: Data-driven starter prompts

**Files:**
- Modify: `components/ai/AIAnalyst.tsx:15-24` (replace hardcoded prompts)
- Modify: `components/Dashboard.tsx` (pass columns to AIAnalyst)

**Step 1: Update AIAnalyst to accept `columns` prop**

Add a `columns` prop of type `DetectedColumns | null`.

Replace `STARTER_PROMPTS` constant with a function:

```typescript
function generateStarterPrompts(columns: DetectedColumns | null): string[] {
  const generic = [
    "What are the 3 most important insights about marketing performance, channel efficiency, and pipeline contribution?",
    "Which channels are underperforming relative to their touch volume? Where should we reallocate budget?",
    "Design a reporting framework to monitor channel efficiency over time. What metrics, cadence, and stakeholders?",
    "If you were presenting this to a VP of Revenue Operations, what story would you tell?",
  ];

  if (!columns) return generic;

  const dynamic: string[] = [];

  if (columns.channel) {
    dynamic.push(`Which ${columns.channel} is most efficient at generating pipeline per touch?`);
  }
  if (columns.interactionStatus && columns.meetingBooked) {
    dynamic.push("Analyze the drop-off between event attendance and meetings booked. What's the nurture opportunity?");
  }
  if (columns.dimensions.length > 0) {
    dynamic.push(`Compare ${columns.dimensions[0]} performance. Where are the biggest gaps?`);
  }
  if (columns.closedWon) {
    dynamic.push("What's the biggest operational or process change you'd recommend based on win rate data?");
  }

  return [...dynamic, ...generic].slice(0, 8);
}
```

**Step 2: Wire it up in Dashboard**

Pass `analysis.columns` to `AIAnalyst`.

**Step 3: Commit**

```bash
git add components/ai/AIAnalyst.tsx components/Dashboard.tsx
git commit -m "feat: generate data-driven starter prompts based on detected columns"
```

---

### Task 17: Accessibility foundations

**Files:**
- Modify: `components/upload/FileUpload.tsx` (keyboard access, aria-label)
- Modify: `components/upload/DashboardBrowser.tsx` (keyboard access)
- Modify: `components/upload/DashboardRow.tsx` (keyboard access)
- Modify: `components/ui/EditableName.tsx` (keyboard access)
- Modify: `components/ai/AIAnalyst.tsx` (aria-label on input)
- Modify: `components/analysis/CrossCutExplorer.tsx` (select label, table scope)
- Modify: `components/analysis/FunnelTable.tsx` (select label, table scope)
- Modify: `components/analysis/DropOffAnalysis.tsx` (table scope)
- Modify: `components/analysis/FieldMapping.tsx` (table scope)

**Step 1: Add keyboard handler utility**

Create a small helper (or inline it) for making divs keyboard-accessible:

```typescript
function onKeyActivate(handler: () => void) {
  return (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handler();
    }
  };
}
```

**Step 2: Fix upload zone in `FileUpload.tsx`**

Add to the upload div:
```tsx
role="button"
tabIndex={0}
aria-label="Upload CSV file"
onKeyDown={onKeyActivate(() => inputRef.current?.click())}
```

Add `aria-label="CSV file"` to the hidden file input.

**Step 3: Fix interactive divs in DashboardBrowser and DashboardRow**

Add `role="button"`, `tabIndex={0}`, `onKeyDown` to folder rows and dashboard rows.

**Step 4: Fix form labels**

In `AIAnalyst.tsx`, add `aria-label="Ask a question about your marketing data"` to the chat input.

In `CrossCutExplorer.tsx` and `FunnelTable.tsx`, add `id` to select elements and `htmlFor` to labels, or add `aria-label` directly to selects.

**Step 5: Add `scope="col"` to table headers**

In all table components (`FunnelTable`, `CrossCutExplorer`, `DropOffAnalysis`, `FieldMapping`), add `scope="col"` to `<th>` elements.

**Step 6: Verify build passes**

Run: `npm run build`

**Step 7: Commit**

```bash
git add components/upload/FileUpload.tsx components/upload/DashboardBrowser.tsx components/upload/DashboardRow.tsx components/ui/EditableName.tsx components/ai/AIAnalyst.tsx components/analysis/CrossCutExplorer.tsx components/analysis/FunnelTable.tsx components/analysis/DropOffAnalysis.tsx components/analysis/FieldMapping.tsx
git commit -m "a11y: add keyboard access, ARIA labels, and table scope attributes"
```

---

### Task 18: Performance quick wins

**Files:**
- Modify: `hooks/useAnalysis.ts` (PapaParse worker option)
- Modify: `components/Dashboard.tsx` (keep tabs mounted)

**Step 1: Enable PapaParse Web Worker**

In `useAnalysis.ts`, update the `loadCSVText` parsing call:

```typescript
const result = Papa.parse<CsvRow>(csvText, {
  header: true,
  skipEmptyLines: true,
  worker: false, // Note: worker mode requires file input, not string
});
```

Actually, PapaParse's `worker: true` only works with `File` objects, not strings. Since we parse strings from localStorage, we can't use workers for stored dashboards. For new file uploads, we could use the worker. For now, keep the `setTimeout` approach which already yields to the event loop.

Instead, focus on the tab mounting optimization.

**Step 2: Keep tab content mounted (avoid re-animation)**

In `Dashboard.tsx`, replace conditional rendering with CSS visibility:

```tsx
{/* Tab Content */}
<div className="py-4 sm:py-5 px-4 sm:px-6">
  <div className={activeTab === "ai" ? "" : "hidden"}>
    <AIAnalyst ... />
  </div>
  <div className={activeTab === "funnel" ? "" : "hidden"}>
    {analysis.selectedDim && <FunnelTable ... />}
  </div>
  <div className={activeTab === "charts" ? "" : "hidden"}>
    {analysis.totals && <Charts ... />}
  </div>
  <div className={activeTab === "crosscut" ? "" : "hidden"}>
    <CrossCutExplorer ... />
  </div>
  <div className={activeTab === "dropoff" ? "" : "hidden"}>
    <DropOffAnalysis ... />
  </div>
  <div className={activeTab === "config" ? "" : "hidden"}>
    {analysis.columns && <FieldMapping ... />}
  </div>
</div>
```

This keeps chart components mounted so they don't re-animate on tab switch.

**Step 3: Verify build passes**

Run: `npm run build`

**Step 4: Commit**

```bash
git add components/Dashboard.tsx
git commit -m "perf: keep tab content mounted to prevent chart re-animation on tab switch"
```

---

## Layer 4: Personal Persistence with Postgres

### Task 19: Install Drizzle ORM and set up database schema

**Files:**
- Modify: `package.json` (add drizzle dependencies)
- Create: `db/schema.ts`
- Create: `db/index.ts`
- Create: `drizzle.config.ts`

**Step 1: Install dependencies**

```bash
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit
```

**Step 2: Create database schema**

```typescript
// db/schema.ts
import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const folders = pgTable("folders", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dashboards = pgTable("dashboards", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  fileName: text("file_name").notNull(),
  csvText: text("csv_text").notNull(),
  columns: jsonb("columns").notNull(),
  rowCount: text("row_count").notNull().default("0"),
  folderId: text("folder_id").references(() => folders.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const aiConversations = pgTable("ai_conversations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  dashboardId: text("dashboard_id").references(() => dashboards.id, { onDelete: "cascade" }).notNull(),
  messages: jsonb("messages").notNull().$type<Array<{ role: string; content: string; timestamp: string }>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

**Step 3: Create database connection**

```typescript
// db/index.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

**Step 4: Create Drizzle config**

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

**Step 5: Update `.env.example`**

Add:
```
# Required for database persistence (Layer 4)
DATABASE_URL=postgresql://...
```

**Step 6: Generate initial migration**

```bash
npx drizzle-kit generate
```

**Step 7: Commit**

```bash
git add db/ drizzle.config.ts package.json package-lock.json .env.example
git commit -m "feat: add Drizzle ORM schema for Postgres persistence (dashboards, folders, conversations)"
```

---

### Task 20: Create dashboard API routes

**Files:**
- Create: `app/api/dashboards/route.ts` (GET, POST)
- Create: `app/api/dashboards/[id]/route.ts` (PUT, DELETE)
- Create: `app/api/folders/route.ts` (GET, POST)
- Create: `app/api/folders/[id]/route.ts` (PUT, DELETE)

**Step 1: Create dashboards list + create route**

```typescript
// app/api/dashboards/route.ts
import { db } from "@/db";
import { dashboards } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(dashboards).orderBy(desc(dashboards.updatedAt));
  return Response.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, fileName, csvText, columns, rowCount, folderId } = body;

  if (!name || !fileName || !csvText) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const [row] = await db.insert(dashboards).values({
    name,
    fileName,
    csvText,
    columns: columns || {},
    rowCount: String(rowCount || 0),
    folderId: folderId || null,
  }).returning();

  return Response.json(row, { status: 201 });
}
```

**Step 2: Create dashboard update + delete route**

```typescript
// app/api/dashboards/[id]/route.ts
import { db } from "@/db";
import { dashboards } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const [row] = await db.update(dashboards)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(dashboards.id, id))
    .returning();

  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(row);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db.delete(dashboards).where(eq(dashboards.id, id)).returning();

  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ success: true });
}
```

**Step 3: Create folder routes (same pattern)**

Similar CRUD for folders.

**Step 4: Commit**

```bash
git add app/api/dashboards/ app/api/folders/
git commit -m "feat: add CRUD API routes for dashboards and folders (Postgres-backed)"
```

---

### Task 21: Add migration from localStorage to Postgres

**Files:**
- Create: `components/ui/MigrationBanner.tsx`
- Modify: `hooks/useDashboardStore.ts` (add migration function)
- Modify: `app/page.tsx` (render migration banner)

**Step 1: Add migration function to store**

```typescript
const migrateToServer = useCallback(async () => {
  const current = storeRef.current;
  if (current.dashboards.length === 0) return;

  // Upload each dashboard to the server
  for (const dashboard of current.dashboards) {
    await fetch("/api/dashboards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dashboard),
    });
  }

  // Upload folders
  for (const folder of current.folders) {
    await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(folder),
    });
  }

  // Clear localStorage after successful migration
  clearAll();
}, [clearAll]);
```

**Step 2: Create MigrationBanner**

Show a banner when localStorage has dashboards and `DATABASE_URL` is configured. Button triggers migration.

**Step 3: Commit**

```bash
git add components/ui/MigrationBanner.tsx hooks/useDashboardStore.ts app/page.tsx
git commit -m "feat: add localStorage to Postgres migration flow"
```

---

### Task 22: Add export/import functionality

**Files:**
- Create: `components/ui/ExportImport.tsx`
- Modify: `components/upload/FileUpload.tsx` (add export/import buttons)

**Step 1: Create ExportImport component**

```typescript
"use client";

import { useCallback } from "react";
import { Download, Upload } from "lucide-react";
import type { DashboardEntry, DashboardFolder } from "@/lib/types";

interface ExportImportProps {
  dashboards: DashboardEntry[];
  folders: DashboardFolder[];
  onImport: (data: { dashboards: DashboardEntry[]; folders: DashboardFolder[] }) => void;
}

export default function ExportImport({ dashboards, folders, onImport }: ExportImportProps) {
  const handleExport = useCallback(() => {
    const data = JSON.stringify({ dashboards, folders }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gtm-analyzer-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [dashboards, folders]);

  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        if (data.dashboards && Array.isArray(data.dashboards)) {
          onImport(data);
        }
      } catch {
        alert("Invalid backup file");
      }
    };
    input.click();
  }, [onImport]);

  if (dashboards.length === 0) return null;

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExport}
        className="flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors py-1 px-2 rounded border border-border"
      >
        <Download size={12} /> Export
      </button>
      <button
        onClick={handleImport}
        className="flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors py-1 px-2 rounded border border-border"
      >
        <Upload size={12} /> Import
      </button>
    </div>
  );
}
```

**Step 2: Wire into FileUpload**

Add export/import buttons to the DashboardBrowser header area.

**Step 3: Commit**

```bash
git add components/ui/ExportImport.tsx components/upload/FileUpload.tsx
git commit -m "feat: add dashboard export/import for portable backups"
```

---

## Final Verification

### Task 23: Full build and lint check

**Step 1: Run typecheck**

Run: `npm run typecheck`
Expected: No type errors

**Step 2: Run lint**

Run: `npm run lint`
Expected: No lint errors (or only pre-existing ones)

**Step 3: Run all tests**

Run: `npm test`
Expected: All tests pass

**Step 4: Run build**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Final commit if any fixes needed**

```bash
git add -A
git commit -m "chore: final build verification and lint fixes"
```

---

## Summary

| Layer | Tasks | Key Deliverables |
|-------|-------|-----------------|
| 1: Quick Wins | 1-7 | Constants file, shared chart theme, dead code removal, div-by-zero fix, doc fixes |
| 2: Reliability | 8-14 | Vitest setup, 3 test suites, CSV error handling, confirmations, storage notifications |
| 3: Features + A11y | 15-18 | Editable field mapping, smart prompts, keyboard access, ARIA, tab mount optimization |
| 4: Postgres | 19-22 | Drizzle + Neon schema, CRUD API routes, localStorage migration, export/import |
| Verification | 23 | Full build + lint + test pass |
