# Marketing Data Analyzer — Code Architecture Reference

## Existing Artifact Code (What to Port)

The working prototype is a single `marketing_analyzer.jsx` file (363 lines) that runs as a React artifact. This document maps every function and component to where it should live in the Next.js project.

---

## Target Project Structure

```
marketing-analyzer/
├── app/
│   ├── page.tsx                    # Landing page with upload
│   ├── layout.tsx                  # Root layout, providers, global styles
│   ├── dashboard/
│   │   ├── page.tsx                # Main analysis view (tabs + KPIs)
│   │   └── layout.tsx              # Dashboard layout wrapper
│   ├── analyses/
│   │   └── page.tsx                # Saved analyses list (Phase 2)
│   ├── compare/
│   │   └── page.tsx                # Side-by-side comparison (Phase 3)
│   ├── api/
│   │   ├── analyze/
│   │   │   └── route.ts            # AI analyst endpoint (Anthropic SDK)
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts        # NextAuth config
│   │   ├── analyses/
│   │   │   └── route.ts            # CRUD for saved analyses (Phase 2)
│   │   └── export/
│   │       ├── pdf/route.ts        # PDF generation (Phase 3)
│   │       └── pptx/route.ts       # PPTX generation (Phase 3)
│   └── globals.css                 # Tailwind base styles
│
├── components/
│   ├── upload/
│   │   └── FileUpload.tsx          # Drag-drop CSV upload
│   ├── analysis/
│   │   ├── KPIRow.tsx              # Top-level summary cards
│   │   ├── FunnelTable.tsx         # Full-funnel table with dimension selector
│   │   ├── Charts.tsx              # 4 bar charts + funnel visualization
│   │   ├── CrossCutExplorer.tsx    # Dimension explorer with variance badge
│   │   ├── DropOffAnalysis.tsx     # Nurture opportunity finder
│   │   └── FieldMapping.tsx        # Column detection config view
│   ├── ai/
│   │   ├── AIAnalyst.tsx           # Chat interface with starter prompts
│   │   └── MessageBubble.tsx       # Individual message rendering
│   ├── ui/
│   │   ├── Card.tsx                # Reusable KPI card
│   │   ├── Callout.tsx             # Info/warning callout bar
│   │   ├── Select.tsx              # Styled dimension selector
│   │   └── TabBar.tsx              # Tab navigation
│   └── export/
│       └── ExportButton.tsx        # PDF/PPTX download (Phase 3)
│
├── lib/
│   ├── analysis.ts                 # Core funnel computation engine
│   ├── columnDetection.ts          # Auto-detect CSV column roles
│   ├── dataContext.ts              # Build text summary for AI
│   ├── formatting.ts              # Number/currency/percent formatters
│   ├── types.ts                    # TypeScript interfaces
│   ├── prisma.ts                   # Prisma client singleton (Phase 2)
│   └── auth.ts                     # NextAuth config (Phase 2)
│
├── hooks/
│   ├── useAnalysis.ts              # Custom hook: manages analysis state
│   └── useAIChat.ts                # Custom hook: manages AI conversation
│
├── prisma/
│   └── schema.prisma               # Database schema (Phase 2)
│
├── public/
│   └── sample-data.csv             # Sample dataset for onboarding
│
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── .env.local                      # API keys (ANTHROPIC_API_KEY, etc.)
└── next.config.js
```

---

## Code Mapping: Artifact → Next.js

### 1. Helper Functions → `lib/formatting.ts`

**Current code (lines 13-16):**
```js
const $ = (n) => n == null || isNaN(n) ? "—" : Math.abs(n) >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : Math.abs(n) >= 1e4 ? `$${(n/1e3).toFixed(0)}K` : `$${Math.round(n).toLocaleString()}`;
const N = (n) => n == null ? "—" : n.toLocaleString();
const P = (n) => n == null || isNaN(n) ? "—" : `${n.toFixed(1)}%`;
const pct = (a, b) => b > 0 ? (a / b) * 100 : 0;
```

**Target (`lib/formatting.ts`):**
```typescript
export function formatCurrency(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return "—";
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e4) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

export function formatNumber(n: number | null | undefined): string {
  return n == null ? "—" : n.toLocaleString();
}

export function formatPercent(n: number | null | undefined): string {
  return n == null || isNaN(n) ? "—" : `${n.toFixed(1)}%`;
}

export function pct(numerator: number, denominator: number): number {
  return denominator > 0 ? (numerator / denominator) * 100 : 0;
}
```

### 2. Utility Functions → `lib/analysis.ts` (internal helpers)

**Current code (lines 5-12):**
```js
const groupBy = (arr, fn) => { ... };
const sumBy = (arr, fn) => { ... };
const countBy = (arr, fn) => { ... };
```

**Target:** Keep as internal helpers in `lib/analysis.ts` or use lodash-es (tree-shakeable lodash) since we're in a real Node.js environment now.

### 3. Column Detection → `lib/columnDetection.ts`

**Current code (lines 19-42):**
```js
function detect(headers, rows) {
  const c = { id:null, contactId:null, channel:null, campaign:null,
    meetingBooked:null, oppId:null, pipeline:null, closedWon:null,
    oppStage:null, interactionStatus:null, dimensions:[] };
  // ... keyword matching logic
}
```

**Target (`lib/columnDetection.ts`):**
```typescript
export interface DetectedColumns {
  id: string | null;
  contactId: string | null;
  channel: string | null;
  campaign: string | null;
  meetingBooked: string | null;
  oppId: string | null;
  pipeline: string | null;
  closedWon: string | null;
  oppStage: string | null;
  interactionStatus: string | null;
  dimensions: string[];
}

export function detectColumns(
  headers: string[],
  sampleRows: Record<string, string>[]
): DetectedColumns {
  // Port exact logic from lines 19-42
  // Add TypeScript types
  // Consider making keyword patterns configurable
}
```

**Enhancement opportunity:** Allow users to override auto-detected mappings via the Field Mapping UI. Store overrides in component state and pass to analysis functions.

### 4. Analysis Engine → `lib/analysis.ts`

**Current code (lines 45-72):**
```js
function analyze(data, cols, dim) { ... }
function dropOffAnalysis(data, cols) { ... }
```

**Target (`lib/analysis.ts`):**
```typescript
export interface FunnelRow {
  name: string;
  touches: number;
  meetings: number;
  opps: number;
  pipeline: number;
  closedWon: number;
  wonCount: number;
  mtgRate: number;
  mtgToOpp: number;
  pipelinePerTouch: number;
  pipelinePerMeeting: number;
  winRate: number;
  avgDeal: number;
  pipelineShare: number;
  touchShare: number;
}

export interface DropOffResult {
  attended: number;
  noMeeting: number;
  breakdowns: {
    label: string;
    data: Record<string, number>;
    total: number;
  }[];
}

export function analyzeFunnel(
  data: Record<string, string>[],
  columns: DetectedColumns,
  dimensionField: string
): FunnelRow[] {
  // Port logic from lines 45-62
}

export function analyzeDropOff(
  data: Record<string, string>[],
  columns: DetectedColumns
): DropOffResult | null {
  // Port logic from lines 64-72
}

export function calculateVariance(
  crossCutResults: FunnelRow[],
  minTouches: number = 20
): { ratio: number; signal: 'strong' | 'moderate' | 'low' } | null {
  // Port logic from line 117
}

export function calculateTotals(funnel: FunnelRow[]): {
  touches: number; meetings: number; opps: number;
  pipeline: number; closedWon: number;
} {
  // Port logic from line 114
}
```

### 5. Data Context Builder → `lib/dataContext.ts`

**Current code (lines 121-132):**
```js
const dataCtx = useMemo(() => {
  // Builds text summary of all analysis results for AI system prompt
}, [...]);
```

**Target (`lib/dataContext.ts`):**
```typescript
export function buildDataContext(
  rawData: Record<string, string>[],
  columns: DetectedColumns,
  funnel: FunnelRow[],
  totals: ReturnType<typeof calculateTotals>,
  dropOff: DropOffResult | null
): string {
  // Port logic from lines 121-132
  // This generates the text that gets sent as system prompt context to Claude
}
```

### 6. AI Query → `app/api/analyze/route.ts`

**Current code (lines 135-148):**
```js
const askAI = useCallback(async(q) => {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: `...${dataCtx}`,
      messages: [...msgs, um]
    })
  });
}, [...]);
```

**Target:** Move to server-side API route to keep API key secure:

```typescript
// app/api/analyze/route.ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: Request) {
  const { messages, dataContext } = await req.json();

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: `You are a Senior Marketing Operations analyst...
    
${dataContext}`,
    messages,
  });

  return Response.json({
    content: response.content.map((b) => ("text" in b ? b.text : "")).join("\n"),
  });
}
```

**Client-side hook (`hooks/useAIChat.ts`):**
```typescript
export function useAIChat(dataContext: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const ask = async (question: string) => {
    const userMsg = { role: "user" as const, content: question };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [...messages, userMsg],
        dataContext,
      }),
    });

    const data = await res.json();
    setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
    setLoading(false);
  };

  return { messages, loading, ask, clear: () => setMessages([]) };
}
```

---

## Component Mapping: Artifact → Next.js

### Reusable UI Components (from lines 78-90)

```
Card component (line 78-84)        → components/ui/Card.tsx
Callout component (line 85-87)     → components/ui/Callout.tsx
Select component (line 88-90)      → components/ui/Select.tsx
```

### Tab Content → Individual Components

| Artifact Code | Lines | Target Component | Notes |
|--------------|-------|-----------------|-------|
| AI chat UI | 184-228 | `components/ai/AIAnalyst.tsx` | Uses `useAIChat` hook |
| Funnel table | 230-257 | `components/analysis/FunnelTable.tsx` | Includes dimension selector |
| Charts | 259-292 | `components/analysis/Charts.tsx` | 4 Recharts + optional funnel |
| Cross-cut table | 294-319 | `components/analysis/CrossCutExplorer.tsx` | Includes variance badge |
| Drop-off view | 321-341 | `components/analysis/DropOffAnalysis.tsx` | Summary cards + breakdowns |
| Config/fields | 344-357 | `components/analysis/FieldMapping.tsx` | Shows detected columns |

### State Management (lines 93-103)

Current state is all in the root component:
```js
const [rawData, setRawData] = useState(null);    // Parsed CSV rows
const [cols, setCols] = useState(null);           // Detected column mapping
const [tab, setTab] = useState("ai");             // Active tab
const [dim, setDim] = useState(null);             // Funnel dimension
const [crossDim, setCrossDim] = useState(null);   // Cross-cut dimension
const [fileName, setFileName] = useState("");      // Upload file name
const [msgs, setMsgs] = useState([]);             // AI chat messages
const [input, setInput] = useState("");            // AI input field
const [loading, setLoading] = useState(false);     // AI loading state
```

**Target:** Extract into custom hook `hooks/useAnalysis.ts`:
```typescript
export function useAnalysis() {
  const [rawData, setRawData] = useState<Record<string, string>[] | null>(null);
  const [columns, setColumns] = useState<DetectedColumns | null>(null);
  const [fileName, setFileName] = useState("");
  const [selectedDim, setSelectedDim] = useState<string | null>(null);
  const [crossCutDim, setCrossCutDim] = useState<string | null>(null);

  // Computed values (same memoized calculations from artifact)
  const funnel = useMemo(() => ...);
  const totals = useMemo(() => ...);
  const crossCut = useMemo(() => ...);
  const dropOff = useMemo(() => ...);
  const variance = useMemo(() => ...);
  const allDimensions = useMemo(() => ...);
  const dataContext = useMemo(() => ...);

  const loadCSV = useCallback((file: File) => {
    // PapaParse logic from lines 105-111
  }, []);

  const reset = useCallback(() => { ... }, []);

  return {
    rawData, columns, fileName, selectedDim, crossCutDim,
    funnel, totals, crossCut, dropOff, variance, allDimensions, dataContext,
    setSelectedDim, setCrossCutDim, loadCSV, reset,
  };
}
```

---

## Style System

### Current (inline styles with constants, lines 75-77):
```js
const S = {
  bg: "#0d1117",      // Page background
  surf: "#161b22",    // Card/surface background
  bdr: "#30363d",     // Border color
  txt: "#e6edf3",     // Primary text
  mut: "#8b949e",     // Muted/secondary text
  accent: "#58a6ff",  // Blue accent (pipeline)
  green: "#3fb950",   // Positive metrics
  red: "#f85149",     // Negative metrics
  orange: "#d29922",  // Warning/touch allocation
  purple: "#bc8cff",  // Nurture/drop-off
};
```

### Target: Tailwind CSS

Map to `tailwind.config.ts`:
```typescript
export default {
  theme: {
    extend: {
      colors: {
        surface: "#161b22",
        border: "#30363d",
        muted: "#8b949e",
        accent: "#58a6ff",
        positive: "#3fb950",
        negative: "#f85149",
        warning: "#d29922",
        nurture: "#bc8cff",
      },
      backgroundColor: {
        base: "#0d1117",
      },
    },
  },
};
```

### Conditional Metric Colors (used throughout tables)

```typescript
// lib/metricColors.ts
export function meetingRateColor(rate: number): string {
  if (rate > 15) return "text-positive";   // B2B event benchmark
  if (rate < 5) return "text-negative";    // Underperforming
  return "text-foreground";
}

export function pipelinePerTouchColor(ppt: number): string {
  if (ppt > 10000) return "text-positive";
  if (ppt < 2000) return "text-negative";
  return "text-foreground";
}

export function mtgToOppColor(rate: number): string {
  if (rate > 70) return "text-positive";
  if (rate < 50) return "text-negative";
  return "text-foreground";
}
```

---

## Dependencies

### package.json

```json
{
  "dependencies": {
    "next": "^14.2",
    "react": "^18.3",
    "react-dom": "^18.3",
    "recharts": "^2.12",
    "papaparse": "^5.4",
    "@anthropic-ai/sdk": "^0.30",
    "next-auth": "^4.24",
    "@prisma/client": "^5.19",
    "pptxgenjs": "^3.12",
    "lucide-react": "^0.400"
  },
  "devDependencies": {
    "typescript": "^5.5",
    "@types/react": "^18.3",
    "@types/papaparse": "^5.3",
    "tailwindcss": "^3.4",
    "autoprefixer": "^10.4",
    "postcss": "^8.4",
    "prisma": "^5.19"
  }
}
```

---

## Environment Variables

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
NEXTAUTH_SECRET=<random-string>
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (Phase 2)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# GitHub OAuth (Phase 2)
GITHUB_ID=
GITHUB_SECRET=

# Database (Phase 2)
DATABASE_URL=postgresql://...
```

---

## Build Order (Phase 1 Implementation Steps)

Follow this exact order to get the app working incrementally:

```
1. npx create-next-app@latest marketing-analyzer --typescript --tailwind --app --use-npm
2. Create lib/types.ts (all TypeScript interfaces)
3. Create lib/formatting.ts (port formatters)
4. Create lib/columnDetection.ts (port detect function)
5. Create lib/analysis.ts (port analyze + dropOff + variance + totals)
6. Create lib/dataContext.ts (port context builder)
7. Create hooks/useAnalysis.ts (combine state + computed values)
8. Create components/ui/Card.tsx + Callout.tsx + Select.tsx
9. Create components/upload/FileUpload.tsx
10. Create components/analysis/KPIRow.tsx
11. Create components/analysis/FunnelTable.tsx
12. Create components/analysis/Charts.tsx
13. Create components/analysis/CrossCutExplorer.tsx
14. Create components/analysis/DropOffAnalysis.tsx
15. Create components/analysis/FieldMapping.tsx
16. Create app/api/analyze/route.ts (AI endpoint)
17. Create hooks/useAIChat.ts
18. Create components/ai/AIAnalyst.tsx
19. Create app/dashboard/page.tsx (wire everything together)
20. Create app/page.tsx (landing with upload → redirect to dashboard)
21. Test with EvenUp CSV
22. Deploy to Vercel
```

---

## Testing Checklist

With the EvenUp dataset (2,538 records), the app should produce:

- [ ] 10 channels detected in funnel table
- [ ] Hosted Events at top (sorted by pipeline = $18.8M)
- [ ] Overall meeting rate ≈ 13.2%
- [ ] Total pipeline ≈ $27.6M
- [ ] Total closed won ≈ $5.0M
- [ ] Concentration warning for Hosted Events (>50% pipeline share)
- [ ] Cross-cut by Account Tier shows ≈6x variance (STRONG signal)
- [ ] Cross-cut by Region shows ≈1.5x variance (LOW/MODERATE)
- [ ] Drop-off: ≈392 attended with no meeting
- [ ] All 4 charts render without errors
- [ ] AI analyst responds with specific numbers from the dataset
- [ ] Field mapping correctly detects all columns

---

## Existing Artifact Source Code

The complete working artifact is in `marketing_analyzer.jsx` — this should be your primary reference. Every function and component above maps directly to code in that file. The artifact runs in Claude.ai's React sandbox and uses:

- `recharts` for charts (BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell)
- `papaparse` for CSV parsing
- Native JS helpers instead of lodash (groupBy, sumBy, countBy)
- Anthropic API direct fetch for AI (will move to SDK server-side)
- Inline styles with a color constants object (will convert to Tailwind)
