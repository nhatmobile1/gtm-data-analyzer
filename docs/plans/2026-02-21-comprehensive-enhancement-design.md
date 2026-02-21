# GTM Data Analyzer — Comprehensive Enhancement Design

**Date:** 2026-02-21
**Scope:** Full codebase enhancement across code quality, reliability, features, and persistence
**User context:** Single-user personal tool deployed on Vercel
**Approach:** Layered enhancement — each layer produces a shippable improvement

---

## Layer 1: Quick Wins

Clean house — fix inaccuracies, remove dead code, consolidate duplicated values.

### 1.1 Documentation Fixes
- Update CLAUDE.md and README: Next.js 14 → Next.js 16
- Add `.env.example` with `ANTHROPIC_API_KEY=` placeholder

### 1.2 Hardcoded Color Consolidation
- Create `lib/chartTheme.ts` — reads CSS custom properties via `getComputedStyle`, exports single `CHART_COLORS` object + shared `TOOLTIP_STYLE`
- Replace duplicated `CHART_COLORS` in `Charts.tsx` and `CrossCutExplorer.tsx`
- Replace inline `style={{ color: "#e6edf3" }}` in `EditableName.tsx` with Tailwind classes
- Replace arbitrary Tailwind values (`bg-[#21262d]`) with CSS variable references

### 1.3 Dead Code Removal
- Remove unused `loadCSV` export from `useAnalysis.ts`

### 1.4 Magic Number Extraction
- Create `lib/constants.ts` for business logic constants:
  - `MIN_TOUCHES_THRESHOLD = 20`
  - `RECOVERY_RATE = 0.1`
  - `DIMENSION_MIN_UNIQUE = 2`
  - `DIMENSION_MAX_UNIQUE = 40`
  - `CONCENTRATION_RISK_THRESHOLD = 0.5`
  - `MEETING_RATE_GREEN = 0.15`
  - `MEETING_RATE_RED = 0.05`
  - `PIPELINE_PER_TOUCH_GREEN = 10000`
  - `PIPELINE_PER_TOUCH_RED = 2000`
  - `VARIANCE_STRONG = 3`
  - `VARIANCE_MODERATE = 1.5`

### 1.5 Division-by-Zero Guard
- Add guard in `dataContext.ts` for `totals.meetings === 0` in funnel summary line

### 1.6 Redundant Computation
- Refactor `buildDataContext()` to accept pre-computed funnel data as a parameter instead of re-calling `analyzeFunnel`

### 1.7 Anthropic Client Guard
- Move `new Anthropic()` inside the handler in `app/api/analyze/route.ts`
- Check for missing API key and return 500 with descriptive error instead of crashing at import time

---

## Layer 2: Reliability

Add testing infrastructure, improve error handling, and add input validation.

### 2.1 Testing Infrastructure
- Install Vitest + `@testing-library/react` + `jsdom`
- Add scripts: `test`, `test:coverage`, `typecheck` (`tsc --noEmit`)

### 2.2 Core Unit Tests

Priority tests for pure functions:

**`lib/analysis.ts` — `analyzeFunnel()`:**
- Correct grouping by dimension
- Metric calculations (mtgRate, pipelinePerTouch, winRate, etc.)
- Sort order (pipeline descending)
- Edge cases: empty data, single row, all-zero values

**`lib/analysis.ts` — `analyzeDropOff()`:**
- Attended/noMeeting counts
- Breakdown groupings by dimension
- Recovery estimate calculation

**`lib/analysis.ts` — `calculateVariance()`:**
- STRONG/MODERATE/LOW thresholds
- Min-touches filter (segments < 20 touches excluded)
- Zero-value handling

**`lib/columnDetection.ts` — `detectColumns()`:**
- Known headers map correctly
- Ambiguous headers (e.g., "Lead Status" vs "Interaction Status")
- Dimension detection boundaries (1, 2, 40, 41 unique values)

**`lib/formatting.ts`:**
- Currency/number/percent formatting edge cases

**`lib/dataContext.ts` — `buildDataContext()`:**
- Output structure completeness
- Division-by-zero scenarios

### 2.3 CSV Error Handling
- Surface `result.errors` from PapaParse to UI (error state in `useAnalysis.ts`)
- File size validation: max 10MB in `FileUpload.tsx` — show error message
- File type validation: show error when non-CSV dropped (currently silent)
- Add `reader.onerror` handler in `page.tsx` `handleFileSelect`

### 2.4 localStorage Safety
- Notify user when a dashboard is dropped due to quota exceeded
- Notify user when 10-dashboard cap is reached

### 2.5 Confirmation Dialogs
- Confirm before "Clear all" deletes all dashboards
- Confirm before deleting individual dashboards

---

## Layer 3: Feature Gaps & Accessibility

Fill Phase 1 functional gaps and bring accessibility to a usable baseline.

### 3.1 Editable Field Mapping
- Convert Field Mapping tab from read-only to interactive
- Each column role gets a dropdown with all CSV headers + "None"
- Changing a mapping re-triggers analysis with updated `DetectedColumns`
- "Reset to auto-detected" button
- Persist custom mappings per dashboard in the store

### 3.2 Smart Starter Prompts
- Replace hardcoded EvenUp-specific prompts with data-driven prompts
- Generate from actual dataset: "What's the top-performing {channel}?" / "Compare {highest-variance dimension} performance"
- Fallback to generic prompts if detection is insufficient

### 3.3 Accessibility Foundations

**Keyboard access:**
- Add `role="button"`, `tabIndex={0}`, `onKeyDown` (Enter/Space) to interactive divs:
  - Upload zone in `FileUpload.tsx`
  - Folder rows in `DashboardBrowser.tsx`
  - Dashboard rows in `DashboardRow.tsx`
  - Editable name in `EditableName.tsx`

**Form labels:**
- `aria-label` on chat input in `AIAnalyst.tsx`
- `id`/`htmlFor` pairs on select dropdowns in `FunnelTable.tsx` and `CrossCutExplorer.tsx`
- `aria-label` on file input in `FileUpload.tsx`

**Table semantics:**
- `scope="col"` on `<th>` elements
- `<caption>` on data tables

**Color-independent indicators:**
- Add text labels or icons alongside color-coded metrics (arrows for good/bad thresholds)
- Not just green/red — colorblind users need a non-color signal

**Focus management:**
- Move focus to dashboard heading after file upload completes

### 3.4 Performance Quick Wins
- **Web Worker for PapaParse:** Use `worker: true` option to prevent UI freeze on large CSVs
- **Compress CSV in localStorage:** LZ-String compression before storage
- **Keep tab content mounted:** Use `display: none` / `hidden` class instead of conditional rendering for chart tabs — prevents re-animation on every tab switch

---

## Layer 4: Personal Persistence with Postgres

Move from localStorage to server-side Postgres for unlimited, cross-device dashboard storage.

### 4.1 Stack
- **ORM:** Drizzle ORM (lightweight, edge-compatible)
- **Database:** Neon Postgres (serverless, free tier: 0.5GB)
- **Auth:** None (single-user personal tool)
- **Protection:** Optional env var password for basic gating

### 4.2 Data Model

```sql
CREATE TABLE dashboards (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  folder_id   TEXT REFERENCES folders(id) ON DELETE SET NULL,
  csv_text    TEXT NOT NULL,  -- LZ-String compressed
  columns     JSONB NOT NULL, -- DetectedColumns (including custom overrides)
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE folders (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ai_conversations (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id  TEXT REFERENCES dashboards(id) ON DELETE CASCADE,
  messages      JSONB NOT NULL, -- Array of {role, content, timestamp}
  created_at    TIMESTAMP DEFAULT NOW()
);
```

### 4.3 Migration Strategy
- Add a "Migrate to cloud" button for existing localStorage dashboards
- On click, upload all dashboards + folders to Postgres
- After successful migration, clear localStorage
- Keep localStorage as immediate fallback if DB is unreachable

### 4.4 API Routes
- `GET /api/dashboards` — list dashboards + folders
- `POST /api/dashboards` — save new dashboard (compressed CSV + column mappings)
- `PUT /api/dashboards/:id` — update name, folder, column mappings
- `DELETE /api/dashboards/:id` — delete dashboard
- `POST /api/folders` / `PUT /api/folders/:id` / `DELETE /api/folders/:id` — folder CRUD

### 4.5 Export/Import
- Export all dashboards as a JSON file (backup)
- Import from JSON file (restore)
- Useful for migrating between environments or disaster recovery

---

## Implementation Order

```
Layer 1 (Quick Wins)        → ~1 session
Layer 2 (Reliability)       → ~2-3 sessions
Layer 3 (Features + A11y)   → ~2-3 sessions
Layer 4 (Postgres)          → ~2-3 sessions
```

Each layer is independently shippable. Stop after any layer for a better product.

---

## Out of Scope (Deferred)

- Multi-user auth (not needed for personal use)
- Multi-file comparison (Phase 3)
- PDF/PPTX export (Phase 3)
- Onboarding flow (Phase 4)
- Light mode / theme toggle
- E2E tests (valuable but lower priority than unit tests)
