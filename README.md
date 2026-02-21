# Marketing Data Analyzer

A web application for Marketing Operations professionals to upload campaign performance CSV data and instantly get full-funnel analysis, interactive visualizations, cross-dimensional exploration, drop-off detection, and AI-powered insights.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4) ![Recharts](https://img.shields.io/badge/Recharts-3-8884d8)

## Features

**Funnel Analysis** — Full-funnel metrics by any dimension (Channel, Campaign, Account Tier, etc.). Sorted by pipeline, not volume. Color-coded against B2B benchmarks with concentration risk warnings.

**Visual Charts** — 5 interactive Recharts visualizations: pipeline distribution, touch vs pipeline misalignment, meeting rate with benchmark line, pipeline per touch efficiency, and full-funnel flow.

**Cross-Cut Explorer** — Slice data by any dimension with an automatic variance signal badge. A 3x+ gap between best/worst segments = STRONG signal worth investigating.

**Drop-Off & Nurture** — Identifies engaged contacts (attended/visited/badge scan) who didn't book meetings. Estimates recoverable pipeline at 10% conversion rate.

**AI Analyst** — Chat interface powered by Claude that answers questions about your data with specific numbers. 8 pre-built starter prompts for common analysis questions.

**Field Mapping** — Auto-detects column roles (channel, pipeline, meeting booked, etc.) via keyword pattern matching. Shows detection status for verification.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/gtm-data-analyzer.git
cd gtm-data-analyzer
npm install
```

### Environment Variables

Create a `.env.local` file:

```bash
# Required for AI Analyst feature
ANTHROPIC_API_KEY=sk-ant-...
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and upload a CSV file.

### Production Build

```bash
npm run build
npm start
```

## CSV Format

The analyzer auto-detects columns by name patterns. Supported fields:

| Field | Detection Pattern | Example Values |
|-------|------------------|----------------|
| Channel | "channel", "source", "medium" | Hosted Events, Direct Mail, Webinars |
| Campaign Name | "campaign" (not "member") | Q1 Enterprise Summit |
| Meeting Booked | "meeting" + yes/no values | Yes, No |
| Pipeline Revenue | "pipeline", "revenue"+"share" | 119500.00 |
| Closed Won Revenue | "closedwon", "wonarr" | 85000.00 |
| Opportunity Stage | "stage" + "opp" | Closed Won, Negotiation |
| Opportunity ID | "opportunityid", "oppid" | OPP-456 |
| Interaction Status | "interaction", "status" | Attended, Visited Booth |

Any remaining categorical column with 2-40 unique values is detected as a **dimension** (Account Tier, Region, AE Owner, etc.).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| CSV Parsing | PapaParse |
| AI | Anthropic SDK (server-side) |
| Icons | Lucide React |

## Project Structure

```
app/                    # Next.js pages and API routes
components/             # React components
  analysis/             #   Funnel table, charts, cross-cut, drop-off, field mapping
  ai/                   #   AI chat interface
  ui/                   #   TabBar, Callout
  upload/               #   CSV file upload
lib/                    # Core logic
  analysis.ts           #   Funnel computation engine
  columnDetection.ts    #   Auto-detect CSV column roles
  dataContext.ts         #   Build AI system prompt from data
  formatting.ts         #   Currency/number/percent formatters
  types.ts              #   TypeScript interfaces
hooks/                  # Custom React hooks
  useAnalysis.ts        #   Analysis state and memoized computations
  useAIChat.ts          #   AI conversation management
reference/              # Original prototype and analysis artifacts
```

## Roadmap

- [x] **Phase 1**: Core app — CSV upload, funnel analysis, charts, cross-cut, drop-off, AI chat
- [ ] **Phase 2**: Auth + persistence — Google/GitHub login, saved analyses, dashboard
- [ ] **Phase 3**: Comparison + export — Multi-file upload, side-by-side comparison, PDF/PPTX export
- [ ] **Phase 4**: Polish — Responsive design, loading states, onboarding, performance optimization

## License

MIT
