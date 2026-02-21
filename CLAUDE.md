# Marketing Data Analyzer

## Project Overview

A web application for Marketing Operations professionals to upload campaign performance CSV data and get full-funnel analysis, interactive visualizations, cross-dimensional exploration, drop-off/nurture opportunity detection, and AI-powered insights via a conversational interface.

**Target user:** Marketing Operations managers who regularly analyze campaign performance data and need to quickly extract actionable insights from B2B SaaS marketing datasets.

**Origin:** Ported from a working 820-line React artifact prototype (`reference/marketing_analyzer.jsx`) into a production Next.js application.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 14 (App Router) | TypeScript, SSR-capable |
| Styling | Tailwind CSS v4 | Dark theme, `@theme inline` syntax |
| Charts | Recharts | BarChart, ComposedChart, FunnelChart |
| CSV Parsing | PapaParse | Client-side parsing |
| AI | Anthropic SDK (server-side) | API route at `/api/analyze` |
| Icons | Lucide React | Minimal icon set |
| Deployment | Vercel | Auto-deploy from GitHub |

---

## Project Structure

```
gtm-data-analyzer/
├── CLAUDE.md                       # THIS FILE - project context
├── app/
│   ├── layout.tsx                  # Root layout, fonts, metadata
│   ├── page.tsx                    # Landing page — shows upload or dashboard
│   ├── globals.css                 # Tailwind v4 theme + custom styles
│   └── api/
│       └── analyze/
│           └── route.ts            # AI analyst endpoint (Anthropic SDK)
├── components/
│   ├── Dashboard.tsx               # Main analysis view (tabs + KPIs)
│   ├── upload/
│   │   └── FileUpload.tsx          # Drag-drop CSV upload
│   ├── analysis/
│   │   ├── KPIRow.tsx              # 5 top-level summary cards
│   │   ├── FunnelTable.tsx         # Full-funnel metrics table
│   │   ├── Charts.tsx              # 5 Recharts visualizations
│   │   ├── CrossCutExplorer.tsx    # Dimension explorer + variance badge
│   │   ├── DropOffAnalysis.tsx     # Nurture opportunity finder
│   │   └── FieldMapping.tsx        # Column detection config
│   ├── ai/
│   │   └── AIAnalyst.tsx           # Chat interface with starter prompts
│   └── ui/
│       ├── TabBar.tsx              # Tab navigation
│       └── Callout.tsx             # Info/warning callout bar
├── lib/
│   ├── types.ts                    # All TypeScript interfaces
│   ├── formatting.ts              # Currency/number/percent formatters + metric colors
│   ├── columnDetection.ts          # Auto-detect CSV column roles
│   ├── analysis.ts                 # Funnel computation engine
│   └── dataContext.ts              # Build text summary for AI system prompt
├── hooks/
│   ├── useAnalysis.ts              # Analysis state + memoized computations
│   └── useAIChat.ts                # AI conversation management
└── reference/                      # Original prototype + analysis artifacts
    ├── marketing_analyzer.jsx      # Source prototype (820 lines)
    ├── MARKETING_ANALYZER_PROJECT.md
    ├── MARKETING_ANALYZER_ARCHITECTURE.md
    ├── Marketing_Data_Analysis_Playbook.md
    ├── EvenUp_Q1_Marketing_Analysis.html
    └── EvenUp_Tasks_2_and_3.html
```

---

## Architecture & Data Flow

```
CSV File → PapaParse → detectColumns() → useAnalysis hook
                                              │
                    ┌─────────────────────────┤
                    │                         │
              analyzeFunnel()           analyzeDropOff()
                    │                         │
              calculateTotals()         calculateVariance()
                    │                         │
              buildDataContext() ──→ AI API Route ──→ Anthropic SDK
```

1. **CSV Upload**: User drops/selects CSV → PapaParse parses client-side
2. **Column Detection**: `detectColumns()` matches headers to funnel roles via keyword patterns
3. **Analysis**: `analyzeFunnel()` computes per-segment metrics, `analyzeDropOff()` finds nurture opportunities
4. **State**: `useAnalysis` hook manages all state + memoized computations
5. **AI**: `buildDataContext()` creates text summary → sent to `/api/analyze` → Anthropic SDK
6. **Rendering**: Dashboard page renders active tab content (Funnel, Charts, CrossCut, DropOff, AI, FieldMapping)

---

## Key Design Decisions

1. **Sort by pipeline, not volume** — Volume is vanity, pipeline is sanity
2. **Variance test for cross-cuts** — Ratio of best/worst $/touch: >=3x = STRONG, >=1.5x = MODERATE, <1.5x = LOW
3. **Color thresholds** — Meeting rate >15% = green, <5% = red. $/touch >$10K = green, <$2K = red
4. **Concentration risk at 50%** — Any channel >50% of pipeline triggers a warning
5. **AI system prompt** — "Senior Marketing Operations analyst" with WHAT/WHY/DO/MEASURE structure
6. **Client-side analysis** — All CSV processing runs in browser, only AI queries hit the server

---

## Theme / Color System

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-base` | `#0d1117` | Page background |
| `--color-surface` | `#161b22` | Card/surface background |
| `--color-border` | `#30363d` | Borders |
| `--color-text` | `#e6edf3` | Primary text |
| `--color-muted` | `#8b949e` | Secondary text |
| `--color-accent` | `#58a6ff` | Blue accent / pipeline |
| `--color-positive` | `#3fb950` | Green / strong metrics |
| `--color-negative` | `#f85149` | Red / weak metrics |
| `--color-warning` | `#d29922` | Orange / touch allocation |
| `--color-nurture` | `#bc8cff` | Purple / drop-off |

---

## Core Interfaces

```typescript
interface DetectedColumns {
  id, contactId, channel, campaign, meetingBooked,
  oppId, pipeline, closedWon, oppStage, interactionStatus: string | null;
  dimensions: string[];
}

interface FunnelRow {
  name: string;
  touches, meetings, opps, pipeline, closedWon, wonCount, closedLost: number;
  mtgRate, mtgToOpp, pipelinePerTouch, pipelinePerMeeting: number;
  winRate, avgDeal, pipelineShare, touchShare: number;
}

interface DropOffResult {
  attended: number;
  noMeeting: number;
  breakdowns: { label: string; data: Record<string, number>; total: number }[];
}
```

---

## Analysis Algorithms

### Column Detection (`lib/columnDetection.ts`)
- Lowercase + strip non-alphanumeric from headers
- Match against keyword patterns (channel, pipeline, meeting, etc.)
- Remaining categorical columns with 2-40 unique values → dimensions[]

### Funnel Analysis (`lib/analysis.ts`)
- Group by dimension field → per-segment: touches, meetings, opps, pipeline, closedWon
- Derived: mtgRate, mtgToOpp, pipelinePerTouch, winRate, avgDeal, pipelineShare, touchShare
- Sorted by pipeline descending

### Drop-Off Analysis
- Filter engaged contacts (attended/visited/badge scan) who didn't book meetings
- Group by each dimension for breakdown tables
- Recovery estimate: noMeeting * 10% * (totalPipeline / totalMeetings)

### Variance Test
- Filter segments with 20+ touches
- Ratio = max($/touch) / min($/touch where > 0)
- >=3x = STRONG SIGNAL, >=1.5x = MODERATE, <1.5x = LOW VARIANCE

---

## Environment Variables

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...   # Required for AI analyst feature
```

---

## Development Commands

```bash
npm run dev          # Start dev server on localhost:3000
npm run build        # Production build
npm run lint         # ESLint check
```

---

## Testing Checklist (EvenUp Dataset — 2,538 records)

- [ ] 10 channels detected in funnel table
- [ ] Hosted Events at top (pipeline = ~$18.8M)
- [ ] Overall meeting rate ~13.2%
- [ ] Total pipeline ~$27.6M, closed won ~$5.0M
- [ ] Concentration warning for Hosted Events (>50% pipeline share)
- [ ] Cross-cut by Account Tier: ~6x variance (STRONG)
- [ ] Drop-off: ~392 attended with no meeting
- [ ] All 5 charts render correctly
- [ ] AI analyst responds with data-backed answers
- [ ] Field mapping correctly detects all columns

---

## Development Phases

### Phase 1: Core App (Current) ✅
Port artifact to Next.js — upload, analysis, charts, cross-cut, drop-off, AI chat, field mapping

### Phase 2: Auth + Persistence (Future)
NextAuth.js (Google/GitHub), Prisma + PostgreSQL, saved analyses dashboard

### Phase 3: Comparison + Export (Future)
Multi-file upload, side-by-side comparison, PDF/PPTX export

### Phase 4: Polish (Future)
Responsive design, loading states, onboarding, performance optimization

---

## Reference Files

- `reference/marketing_analyzer.jsx` — Working prototype (source of truth for logic)
- `reference/MARKETING_ANALYZER_PROJECT.md` — Full project spec
- `reference/MARKETING_ANALYZER_ARCHITECTURE.md` — Code architecture + build order
- `reference/Marketing_Data_Analysis_Playbook.md` — Analysis methodology
- `reference/EvenUp_Q1_Marketing_Analysis.html` — Static analysis dashboard
- `reference/EvenUp_Tasks_2_and_3.html` — Reporting framework reference
