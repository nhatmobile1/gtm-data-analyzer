# Marketing Data Analyzer — Full Project Context

## Overview

A web application that lets Marketing Operations professionals upload campaign performance CSV data and instantly get full-funnel analysis, interactive visualizations, cross-dimensional exploration, drop-off/nurture opportunity detection, and AI-powered insights via conversational interface.

**Target user:** Marketing Operations managers (like me — 9+ years MOps experience at companies like Benchling, Intercom, Malwarebytes) who regularly analyze campaign performance data and need to quickly extract actionable insights.

**Origin:** Built as a Claude artifact during a take-home assignment for a Senior Revenue Operations Manager role. Now being converted to a full-stack web application for reuse across any B2B SaaS marketing dataset.

---

## What the App Does (Feature Set)

### Core Features (all working in artifact prototype)

1. **CSV Upload + Auto-Funnel Detection**
   - Drag-and-drop or click-to-upload CSV files
   - Auto-detects column roles by name pattern matching:
     - Channel, Campaign Name, Meeting Booked (yes/no), Opportunity ID, Pipeline Revenue, Closed Won Revenue, Opportunity Stage, Interaction Status
   - Identifies "dimensions" — any categorical column with 2–40 unique values (Account Tier, Region, AE Owner, Account Type, etc.)
   - Shows a Field Mapping config tab so users can verify/correct detection

2. **Funnel Analysis Table**
   - Full-funnel metrics by any dimension: Touches → Meetings → Opportunities → Pipeline → Closed Won
   - Metrics per row: touch count, % of total, meeting rate, mtg→opp conversion, pipeline, pipeline share, $/touch, closed won, win rate
   - Sorted by pipeline (not volume — this is a deliberate design choice)
   - Color-coded: green for strong metrics (>15% mtg rate, >$10K/touch, >70% mtg→opp), red for weak
   - Row highlighting: blue tint for >30% pipeline share, red tint for high-touch/low-pipeline misalignment
   - Auto-generates concentration risk warning if any single segment >50% of pipeline

3. **Visual Charts (4 + 1)**
   - Pipeline distribution bar chart (by selected dimension)
   - Touch % vs Pipeline % grouped bar chart (shows resource misalignment)
   - Meeting rate bar chart with 15% benchmark line
   - Pipeline per touch (efficiency) bar chart
   - Full-funnel waterfall/funnel visualization (touches → meetings → opps → won)

4. **Cross-Cut Explorer**
   - Pick any dimension from dropdown, see funnel metrics for each segment
   - **Variance test badge**: Automatically calculates the ratio between best and worst $/touch values (for segments with 20+ touches)
     - 🟢 STRONG SIGNAL: 3x+ gap (this dimension meaningfully predicts performance)
     - 🟡 MODERATE: 1.5x–3x gap
     - 🔇 LOW VARIANCE: <1.5x (mostly noise, not worth including in analysis)
   - Dual-axis chart: $/touch bars + meeting rate dots overlaid

5. **Drop-Off & Nurture Opportunity Finder**
   - Filters for contacts who "engaged" (Interaction Status = Attended, Visited Booth, Badge Scan) but did NOT book a meeting
   - Summary cards: total engaged, total dropped, estimated pipeline if 10% recovered
   - Breakdown tables by every available dimension (channel, account tier, account type, region, etc.)
   - Estimated recovery pipeline = (dropped contacts × 10%) × (avg pipeline per meeting from overall data)

6. **🤖 AI Analyst (Chat Interface)**
   - Sends computed data summary (full funnel, channel table, dimension breakdowns, drop-off stats) as context to Claude Sonnet via Anthropic API
   - 8 pre-built starter prompts mapped to common take-home assignment questions:
     1. "What are the 3 most important insights?"
     2. "Which channels are underperforming relative to touch volume?"
     3. "Design a reporting framework — metrics, cadence, stakeholders"
     4. "Recommend one operational/process change"
     5. "Analyze drop-off between attendance and meetings"
     6. "Compare Account Tier performance"
     7. "What's broken with Direct Mail?"
     8. "Brief a VP of Revenue Operations"
   - Free-form question input with multi-turn conversation support
   - Markdown rendering for AI responses (headers, bold, bullets)
   - System prompt instructs AI to be quantitative, cite specific numbers, and structure recommendations as: WHAT'S HAPPENING → WHY IT MATTERS → WHAT TO DO → HOW TO MEASURE

### New Features for Web App v1

7. **User Authentication & Saved Analyses**
   - Login via Google/GitHub (NextAuth.js)
   - Save uploaded datasets and their analysis results
   - Name and tag analyses for later retrieval
   - Dashboard showing past analyses with key metrics preview

8. **Multiple File Upload + Comparison**
   - Upload 2+ CSV files (e.g., Q1 vs Q2, or pre/post campaign change)
   - Side-by-side funnel comparison
   - Delta calculations: show improvement/decline in each metric
   - Highlight statistically significant changes

9. **Export Reports as PDF/Slides**
   - One-click export of current analysis view
   - PDF: formatted tables + charts + AI insights
   - Slide deck (PPTX): executive summary format with key findings
   - Include auto-generated insight summaries via AI

---

## Tech Stack Decision

**Next.js 14 (App Router) + TypeScript** — chosen for:
- Single codebase (frontend + API routes)
- React skills transfer to other projects
- Artifact code ports directly (it's already React)
- Vercel deployment is one-click
- TypeScript catches bugs early
- Largest ecosystem for charts, auth, DB, export libraries

### Full Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 14 (App Router) | Full-stack React, API routes, SSR |
| Language | TypeScript | Type safety, better DX |
| Styling | Tailwind CSS | Matches artifact aesthetic, utility-first |
| Charts | Recharts (or Plotly.js) | Already working in artifact |
| Auth | NextAuth.js | Google/GitHub OAuth, session management |
| Database | Prisma + PostgreSQL | Type-safe ORM, migrations, saved analyses |
| AI | Anthropic SDK (server-side) | Keeps API key secure in API route |
| PDF Export | @react-pdf/renderer or Puppeteer | Generate formatted reports |
| PPTX Export | pptxgenjs | Generate slide decks |
| CSV Parsing | PapaParse | Already working in artifact |
| Hosting | Vercel | Free tier, auto-deploy from GitHub |
| Database Host | Neon or Supabase | Free tier PostgreSQL |

---

## Data Model

### CSV Input Format (what users upload)

The auto-detection handles various column naming conventions, but the canonical fields are:

| Field | Type | Example Values | Role |
|-------|------|---------------|------|
| Campaign Member ID | string | "CM-001" | Unique record identifier |
| Contact ID | string | "CON-123" | Links to CRM contact |
| Channel | categorical | "Hosted Events", "Direct Mail", "Webinars" | Primary grouping dimension |
| Campaign Name | categorical | "Q1 Enterprise Summit" | Secondary grouping |
| Interaction Status | categorical | "Attended", "Registered", "Gift Delivered", "Visited Booth" | Engagement depth indicator |
| Meeting Booked | yes/no | "Yes", "No" | Key conversion event |
| Opportunity ID | string/null | "OPP-456" or empty | Links to pipeline |
| Pipeline Revenue Share | numeric | 119500.00 | Dollar value attributed |
| Closed Won ARR | numeric | 85000.00 or 0 | Revenue closed |
| Opportunity Stage | categorical | "Closed Won", "Closed Lost", "Negotiation" | Current opp status |
| Account Tier | categorical | "Tier 1", "Tier 2" | Account segmentation |
| Account Type | categorical | "Prospect", "Customer", "Churned" | Account relationship |
| Region | categorical | "North America", "EMEA" | Geographic segment |
| AE Owner | categorical | "James O'Brien", "Sarah Chen" | Sales rep assignment |
| Campaign Response Date | date | "2026-01-15" | When engagement happened |

### Database Schema (for saved analyses)

```
User
  - id
  - email
  - name
  - provider (google/github)
  - createdAt

Analysis
  - id
  - userId (FK)
  - name (user-defined)
  - fileName
  - recordCount
  - detectedColumns (JSON — the column mapping)
  - summaryMetrics (JSON — totals: touches, meetings, opps, pipeline, closedWon)
  - createdAt
  - updatedAt

AnalysisData
  - id
  - analysisId (FK)
  - rawData (JSON — the parsed CSV, or store as file reference)

AIConversation
  - id
  - analysisId (FK)
  - messages (JSON array — [{role, content, timestamp}])
  - createdAt
```

---

## Analysis Logic (Core Algorithms)

These are the key computation functions that need to be ported from the artifact. They should live in `lib/analysis.ts`.

### 1. Column Detection (`detect`)

```
Input: headers (string[]), sampleRows (first 100 rows)
Output: { channel, campaign, meetingBooked, oppId, pipeline, closedWon, oppStage, interactionStatus, dimensions[] }

Logic:
- Lowercase + strip non-alphanumeric from each header
- Match against keyword patterns:
  - "channel" or "source" → channel
  - "campaign" (not "member") → campaign
  - "meeting" (not "date") + has yes/no values → meetingBooked
  - "pipeline" or "revenue"+"share" → pipeline
  - "closedwon" or "woncarr" → closedWon
  - "stage" + ("opp" or "opportunity") → oppStage
  - "opportunityid" or "oppid" → oppId
  - "interaction" or "status" (not "opp") → interactionStatus
- Remaining headers: if categorical (not all numeric) with 2–40 unique values → dimensions[]
```

### 2. Funnel Analysis (`analyze`)

```
Input: data (all rows), columns (detected mapping), dimensionField (string)
Output: Array of segment objects sorted by pipeline descending

Per segment:
  touches = row count
  meetings = count where meetingBooked === "yes"
  opps = count where oppId is truthy
  pipeline = sum of pipeline field
  closedWon = sum of closedWon field
  wonCount = count where closedWon > 0

Derived:
  mtgRate = meetings / touches × 100
  mtgToOpp = opps / meetings × 100
  pipelinePerTouch = pipeline / touches
  pipelinePerMeeting = pipeline / meetings
  winRate = wonCount / opps × 100
  avgDeal = closedWon / wonCount
  pipelineShare = pipeline / totalPipeline × 100
  touchShare = touches / totalTouches × 100
```

### 3. Drop-Off Analysis

```
Input: data, columns
Output: { attended, noMeeting, breakdowns[] }

Logic:
1. Filter "engaged" contacts: interactionStatus contains "attended", "visited", or "badge"
2. Of those, filter where meetingBooked !== "yes"
3. Group by each available dimension → breakdown tables
4. Recovery estimate: noMeeting × 10% × (totalPipeline / totalMeetings)
```

### 4. Variance Test

```
Input: cross-cut analysis results
Output: variance ratio (float) + signal classification

Logic:
1. Filter segments with 20+ touches
2. Get pipelinePerTouch for each
3. ratio = max(ppt) / min(ppt where ppt > 0)
4. Classify: ≥3x = STRONG, ≥1.5x = MODERATE, <1.5x = LOW
```

### 5. Data Context Builder (for AI)

```
Input: all computed analysis results
Output: text summary string sent as system prompt context

Includes:
- Overall funnel: touches → meetings → opps → pipeline → closedWon with conversion rates
- Channel funnel table (all metrics per channel)
- Top 4-5 dimension breakdowns (same metrics per segment)
- Drop-off stats if available
```

---

## UI Design

### Theme
- Dark mode (GitHub-inspired): `#0d1117` background, `#161b22` surfaces, `#30363d` borders
- Accent colors: `#58a6ff` (blue/pipeline), `#3fb950` (green/positive), `#f85149` (red/negative), `#d29922` (orange/warning), `#bc8cff` (purple/nurture)
- Font: system-ui, monospace for numbers
- Conditional coloring on metrics (green if strong, red if weak, based on B2B benchmarks)

### Layout
```
┌─────────────────────────────────────────────┐
│ Header: Logo + File Name + Record Count     │
├─────────────────────────────────────────────┤
│ KPI Row: Touches | Meetings | Opps | Pipe | Won │
├─────────────────────────────────────────────┤
│ Tab Bar: 🤖 AI | Funnel | Charts | Cross-Cut | Drop-Off | Fields │
├─────────────────────────────────────────────┤
│                                             │
│              Active Tab Content             │
│                                             │
└─────────────────────────────────────────────┘
```

### Responsive Considerations
- KPI row: 5-across on desktop, 2-3 columns on tablet, stack on mobile
- Charts: 2-column grid on desktop, single column on mobile
- Tables: horizontal scroll on small screens
- AI chat: full-width at all sizes

---

## Key Design Decisions & Rationale

1. **Sort by pipeline, not volume** — Volume is vanity, pipeline is sanity. A channel with 900 touches but $3M pipeline should rank below a channel with 500 touches and $18M pipeline.

2. **Variance test for cross-cuts** — Not every dimension matters equally. Region might show <1.5x gap (noise) while Account Tier shows 6x (signal). The badge tells users where to focus.

3. **Color thresholds based on B2B benchmarks** — Meeting rate >15% = green (events benchmark), <5% = red (digital underperform). $/touch >$10K = green, <$2K = red. These are standard B2B SaaS ranges.

4. **AI system prompt structure** — Instructs Claude to be a "Senior Marketing Operations analyst" and structure recommendations as WHAT'S HAPPENING → WHY IT MATTERS → WHAT TO DO → HOW TO MEASURE. This matches how MOps leaders present to stakeholders.

5. **Drop-off = biggest untapped opportunity** — In our analysis, 73% of event attendees didn't book meetings. This is almost always the highest-leverage finding in B2B marketing data.

6. **Concentration risk flag at 50%** — Industry best practice: no single channel should be >50% of pipeline. One bad quarter from that channel = catastrophic miss.

---

## Development Phases

### Phase 1: Core App (Port Artifact)
- [ ] Scaffold Next.js 14 project with TypeScript + Tailwind
- [ ] Port analysis logic to `lib/analysis.ts`
- [ ] Port column detection to `lib/columnDetection.ts`
- [ ] Build FileUpload component (drag-drop + click)
- [ ] Build FunnelTable component with dimension selector
- [ ] Build Charts component (4 bar charts + funnel)
- [ ] Build CrossCutExplorer with variance badge
- [ ] Build DropOffAnalysis with summary cards + breakdowns
- [ ] Build FieldMapping config view
- [ ] Build AIAnalyst chat interface
- [ ] Create API route `/api/analyze` for AI queries (Anthropic SDK server-side)
- [ ] Wire up tab navigation and KPI header
- [ ] Test with EvenUp CSV dataset
- [ ] Deploy to Vercel

### Phase 2: Auth + Persistence
- [ ] Set up Prisma + PostgreSQL (Neon/Supabase)
- [ ] Configure NextAuth.js (Google + GitHub providers)
- [ ] Build login/signup flow
- [ ] Create Analysis model — save uploaded data + detected columns + summary metrics
- [ ] Build "My Analyses" dashboard page
- [ ] Add "Save Analysis" button to main view
- [ ] Load saved analyses from DB

### Phase 3: Comparison + Export
- [ ] Multiple file upload UI
- [ ] Side-by-side funnel comparison view
- [ ] Delta calculations and highlight significant changes
- [ ] PDF export (tables + charts + AI insights)
- [ ] PPTX export (executive summary slide deck)
- [ ] Download buttons in header

### Phase 4: Polish
- [ ] Responsive design pass (tablet + mobile)
- [ ] Loading states and error handling
- [ ] Empty states for missing data
- [ ] Keyboard shortcuts (Tab switching, Enter to send AI query)
- [ ] Onboarding — sample dataset or walkthrough
- [ ] Performance optimization for large CSVs (>10K rows)

---

## Reference Data: EvenUp Take-Home Analysis

The prototype was built analyzing this specific dataset. These findings serve as the "gold standard" the app should be able to reproduce:

**Dataset:** 2,538 campaign member records, 10 channels, Q1 2026

**Key Findings:**
1. **Concentration Risk:** Hosted Events = 21% of touches but 68% of pipeline ($18.8M) and 74% of closed won ($3.7M). Meeting rate 29.1%, $34,599/touch.
2. **Direct Mail Inefficiency:** 910 touches (36%) but only 11% of pipeline ($3.0M). "Few" high-value gifts: 17% mtg rate, $16K/touch. "Many" low-value gifts: 6.6% mtg rate, $1.8K/touch. 89% of volume goes to the low-efficiency tier.
3. **Webinar/Digital Underperformance:** 200 touches → 3 meetings (1.5%) → $42K pipeline → $0 closed won.
4. **Drop-Off Opportunity:** 392 event attendees didn't book meetings (73% of attendees). Estimated $4.6M recoverable pipeline at 10% conversion.
5. **Account Tier Signal:** Tier 1 = $19.7K/touch vs Tier 2 = $3.3K/touch (6x gap). 46% of touches go to Tier 2.
6. **Interaction Status Signal:** "Attended" = $30.6K/touch vs "Gift Delivered" = $3.3K/touch (10x gap).

---

## Files from This Session

These files were created during the analysis session and should be kept as reference:

1. `marketing_analyzer.jsx` — Working React artifact (the prototype to port)
2. `EvenUp_Q1_Marketing_Analysis.html` — Static analysis dashboard (8 tables)
3. `EvenUp_Tasks_2_and_3.html` — Reporting framework + operational recommendation
4. `Marketing_Data_Analysis_Playbook.md` — Reusable methodology guide

---

## Environment & Accounts

- **Deployment:** Vercel (linked to GitHub)
- **Database:** Neon or Supabase (PostgreSQL) — free tier
- **AI API:** Anthropic API (need `ANTHROPIC_API_KEY` env var)
- **Auth:** NextAuth.js with Google + GitHub OAuth (need client IDs/secrets)
- **Local dev:** Node.js 18+, npm/pnpm
