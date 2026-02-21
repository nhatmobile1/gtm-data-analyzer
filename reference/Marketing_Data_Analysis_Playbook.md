# Marketing Data Analysis Playbook
## A Practical Guide for MOps Professionals — Take-Home Assignments, Dashboards & On-the-Job Analysis

---

## How to Use This Guide

This playbook walks you through a repeatable methodology for analyzing marketing campaign and pipeline data, surfacing insights, designing reporting frameworks, and making operational recommendations. It's designed for two contexts:

1. **Take-home assignments** — structured, time-boxed analysis for RevOps/MOps interviews
2. **On-the-job analysis** — building dashboards, presenting to leadership, and driving operational change

The methodology is the same in both cases. The difference is scope and polish.

---

## Part 1: The Analysis Methodology (Step-by-Step)

### Phase 1: Orient (15-20 minutes)

Before touching the data, understand what you're working with.

**Read the brief carefully.** Highlight what they're specifically asking for. Most take-home assignments have 2-3 explicit deliverables — make sure you address each one directly.

**Understand the data dictionary.** For every field, ask:
- Is this a **dimension** (something I group by) or a **measure** (something I calculate)?
- Is this a **funnel stage** (helps me build conversion flows)?
- Is this a **segmentation field** (helps me slice and compare)?

**Map the funnel stages in the data.** Before any analysis, identify which columns represent progression through the buyer journey. For example:

```
Campaign Touch → Interaction Status → Meeting Booked → Opportunity Created → 
Pipeline $ → Opportunity Stage → Closed Won Revenue
```

This is your analytical backbone. Every insight you surface should connect back to how something moves (or doesn't move) through this funnel.

**State your assumptions early.** If the data is ambiguous, write down your assumptions. Interviewers want to see your reasoning, not perfection. Common assumptions to call out:
- Attribution model (last-touch, first-touch, multi-touch)
- How you're handling records with no opportunity
- How you're defining "conversion" at each stage
- Time period considerations (is one quarter enough to draw conclusions?)

---

### Phase 2: Explore the Data (30-45 minutes)

Work through these five layers in order. Each one builds on the previous.

#### Layer 1: Size and Shape
Get the basics first. How many records? How many unique contacts? What's the date range? What are the distinct values in each categorical field?

**Key questions:**
- How many total records and unique contacts?
- What channels/campaigns exist?
- What's the distribution of records across key dimensions?
- Are there any data quality issues (nulls, unexpected values)?

**Why this matters:** You need to know the denominator before you can calculate any rates. You also need to spot if certain segments have too few records to draw conclusions from.

#### Layer 2: Full-Funnel by Primary Dimension
Pick the most important dimension (usually **channel** or **campaign type**) and build a complete funnel table:

| Channel | Touches | Meetings | Mtg Rate | Opps | Mtg→Opp % | Pipeline | $/Touch | Closed Won | Win Rate |
|---------|---------|----------|----------|------|-----------|----------|---------|------------|----------|

**Why this specific table format?** It forces you to calculate conversion rates at every stage, not just top-of-funnel. The most interesting insights almost always come from *where the funnel breaks* — not from the top.

**Pro tip:** Sort this table by pipeline contribution (descending), not by touch volume. Volume is vanity; pipeline is sanity.

#### Layer 3: Segment Cross-Cuts
Now slice the funnel by secondary dimensions to test whether they reveal meaningful variance:

- **Account Tier** × Channel (does tier affect conversion within a channel?)
- **Account Type** × Channel (do prospects vs customers vs churned behave differently?)
- **Interaction Status** × Outcomes (does engagement depth predict pipeline?)
- **AE Owner** × Outcomes (is there performance variance by rep?)
- **Region** × Outcomes (is there geographic variance?)

**The variance test:** For each dimension, calculate the ratio between the best and worst performing segments. If the ratio is less than ~1.5x on key metrics, the dimension is likely noise. If it's 3x+, it's a signal you should include in your analysis.

Example from the EvenUp analysis:
- Account Tier: Tier 1 = $19.7K/touch vs Tier 2 = $3.3K/touch → **6x gap = strong signal**
- Region: West = $11.5K/touch vs Midwest = $9.7K/touch → **1.2x gap = noise**

#### Layer 4: Conversion Drop-Off Analysis
Look for where the funnel leaks. For each stage transition, ask:

**"Who made it to this stage but didn't make it to the next — and what do they have in common?"**

This is often the richest source of insights and operational recommendations. Examples:
- 392 people attended events but didn't book meetings — why?
- 701 gifts were delivered with no meeting follow-up — is there an AE SLA issue?
- Webinars have 33% no-show rates — is the promotion or content off?

This analysis also feeds directly into **Task 3** (operational recommendations) on most take-home assignments.

#### Layer 5: Anomalies and Paradoxes
Look for things that don't make intuitive sense. These make the best talking points in presentations:

- "Few" high-value gifts have 17% meeting rate but $0 closed won (paradox: good meetings, no revenue)
- Churned accounts have *higher* pipeline per touch than active customers (hidden opportunity)
- Email Marketing has the highest meeting-to-opp conversion (88.9%) but tiny volume (9 meetings)

**Anomalies signal either a problem to fix or an opportunity to scale.**

---

### Phase 3: Synthesize Insights (30 minutes)

You'll have a lot of data points by now. The skill is **distilling them into 3-5 insights that tell a coherent story.**

#### The Insight Formula

A strong insight has three components:

```
OBSERVATION (what the data shows)
+ SO WHAT (why it matters to the business)
+ NOW WHAT (what action it implies)
```

**Weak insight:** "Hosted Events generated the most pipeline."
**Strong insight:** "68% of pipeline comes from a single channel (Hosted Events), creating dangerous concentration risk. If event budgets are cut or events are cancelled, there's no backup channel generating meaningful pipeline. We need to grow Industry Events and Paid Search as secondary pipeline sources."

#### Prioritizing Insights

Not all insights are equal. Rank them by:

1. **Revenue impact** — How much pipeline/revenue does this affect?
2. **Actionability** — Can someone actually do something about this?
3. **Surprise factor** — Does this challenge assumptions or reveal something non-obvious?

Lead with the insight that scores highest across all three.

#### The "So What" Ladder

For each insight, climb the ladder:
- **Level 1 (Descriptive):** "Direct Mail has a 7.7% meeting rate" ← too basic
- **Level 2 (Comparative):** "Direct Mail's meeting rate is 4x lower than Hosted Events" ← better
- **Level 3 (Diagnostic):** "Direct Mail's low meeting rate is driven by sending 89% of volume to 'Many' gifts (6.6% rate) vs 'Few' gifts (17% rate)" ← good
- **Level 4 (Prescriptive):** "Shifting 30% of 'Many' gift budget to 'Few' gifts with an AE follow-up SLA could increase DM meetings by 40%" ← this is what leadership wants

**Always aim for Level 3-4 in your deliverable.**

---

## Part 2: Designing a Reporting Framework

When an assignment asks you to "design a reporting framework," they want to see that you think beyond dashboards. Here's the structure:

### The Five Components

#### 1. Metric Selection
Choose 4-6 metrics that cover three types:

| Type | Purpose | Examples |
|------|---------|---------|
| **Health metrics** | Is the system working? | Total pipeline, meeting rate, pipeline coverage ratio |
| **Efficiency metrics** | Are we getting value from our spend? | $/touch, $/meeting, CAC, pipeline per channel |
| **Risk metrics** | What could go wrong? | Pipeline concentration %, closed-lost rate, channel dependency |

**Pro tip:** Always include at least one "risk" or "leading indicator" metric. This shows you think beyond reporting what happened and into preventing what could go wrong.

#### 2. Dashboard Format
Specify the tool and layout. In a B2B SaaS context:

- **Sigma/Tableau/Looker** connected to **Snowflake/BigQuery** for BI dashboards
- **Salesforce Reports** for operational views that AEs and managers access daily
- **Google Slides / executive summary** for monthly leadership reviews

Design tip: Describe 2-3 "views" of the same data — executive summary (KPI tiles + one chart), operational detail (filterable table), and trend view (quarter-over-quarter).

#### 3. Review Cadence
Map each meeting to a frequency, audience, and decision it drives:

| Cadence | Audience | Focus | Decision It Drives |
|---------|----------|-------|-------------------|
| Weekly | MOps + Demand Gen | Campaign anomalies, data quality | Pause/boost individual campaigns |
| Bi-weekly | MOps + Sales Ops | Lead quality, SLA compliance | Routing adjustments, AE accountability |
| Monthly | VP Marketing + VP RevOps | Pipeline trends, channel efficiency | Budget reallocation |
| Quarterly | CMO + Finance | Strategic channel mix, concentration risk | Annual planning inputs, major pivots |

#### 4. Decision Triggers
This is what separates good frameworks from great ones. Define explicit thresholds:

- "If any channel exceeds 50% of pipeline, trigger a concentration review"
- "If a channel produces <$1K/touch for 2 consecutive quarters, flag for sunsetting"
- "If meeting-to-opp conversion drops below 60%, investigate lead quality or AE follow-up"

#### 5. Feedback Loop
How does the report drive action, and how do you measure if the action worked? Close the loop:

```
Report shows problem → Team takes action → Next report shows impact → Iterate
```

---

## Part 3: Making Operational Recommendations

### The Recommendation Structure

When presenting a process change, use this five-part structure. It works for both take-home assignments and real internal proposals.

#### 1. What's Broken (The Problem)
State the problem with data. Don't just say "follow-up is inconsistent" — say "392 event attendees (73% of all attendees) left without a booked meeting and entered no structured follow-up process, representing an estimated $4.6M in unrealized pipeline."

**Quantify the gap.** Leadership responds to dollar amounts, not percentages.

#### 2. What to Change (The Solution)
Describe the new process clearly. Use a "current state vs. proposed state" comparison to make the contrast sharp.

#### 3. How to Implement (The Plan)
Break implementation into phases:
- **Phase 1: Design** — Define requirements, get stakeholder alignment
- **Phase 2: Build** — Create the automation/processes/templates
- **Phase 3: Pilot** — Test on a small subset, gather feedback
- **Phase 4: Roll Out** — Expand to full scope, train the team

Name the specific tools you'd use (Marketo, Salesforce, Workato, Slack, etc.). This shows you can actually execute, not just strategize.

#### 4. How to Measure Success
Define 2-3 KPIs with baseline (current) and target values:

```
Metric: Attended → Meeting conversion
Baseline: 27%
Target: 40% within 2 quarters
```

Include both **outcome KPIs** (pipeline, revenue) and **operational KPIs** (SLA compliance, response time).

#### 5. Why This Over Other Options
Show you considered alternatives. A simple comparison table works:

| Option | Impact | Effort | Verdict |
|--------|--------|--------|---------|
| A. Budget reallocation | High | High (needs approval) | Strategic but slow |
| B. Fix webinars | Moderate | Medium | Low ceiling |
| **C. Post-event SLA** | **High** | **Low-Medium** | **Best ROI** |

This demonstrates strategic thinking — you didn't just pick the first idea, you evaluated tradeoffs.

---

## Part 4: Presentation Tips

### For Take-Home Assignments (45-60 min meetings)

**Time allocation:**
- 5 min: Executive summary / context setting
- 15 min: Key insights (this is where VPs dig in — be ready for questions)
- 10 min: Reporting framework
- 10 min: Operational recommendation
- 5 min: Q&A buffer

**Anticipate questions:**
- "What would you do with more data?" (Answer: cost data for true ROI, time-in-stage for velocity, multi-touch attribution data)
- "How would you prioritize if you could only do one thing?" (Always pick the highest impact-to-effort ratio)
- "What assumptions are you making?" (Be upfront — it shows intellectual honesty)
- "How does this work at scale?" (Reference automation tools you'd use)

**Format choice:**
- **Slides** = better for time-boxed presentations with a clear agenda
- **Document** = better if they want depth and you'll walk through it as a conversation
- When in doubt, ask. If they don't specify, slides are safer for exec audiences.

### For On-the-Job Presentations

**Know your audience's language:**
- VP of Marketing cares about: pipeline generated, channel mix, campaign ROI
- VP of RevOps cares about: funnel conversion rates, data quality, process efficiency, SLA compliance
- CFO/Finance cares about: CAC, pipeline coverage ratio, marketing spend efficiency, forecast accuracy

**Lead with the "so what," not the methodology.** Nobody in leadership wants to hear how you built the pivot table. They want to know what's broken and how to fix it.

---

## Part 5: Quick-Reference Checklists

### Data Analysis Checklist

- [ ] Read the brief / define the question
- [ ] Map the funnel stages in the data
- [ ] Document your assumptions
- [ ] Row count, unique records, date range
- [ ] Distribution of each categorical field
- [ ] Full-funnel table by primary dimension (channel)
- [ ] Sort by pipeline, not volume
- [ ] Cross-cut by 3-4 secondary dimensions
- [ ] Identify which dimensions show real variance (>2x gap)
- [ ] Conversion drop-off analysis (who fell out and why?)
- [ ] Look for anomalies and paradoxes
- [ ] Synthesize into 3-5 insights using the Observation → So What → Now What formula
- [ ] Rank insights by revenue impact, actionability, and surprise factor

### Reporting Framework Checklist

- [ ] 4-6 metrics covering health, efficiency, and risk
- [ ] Dashboard format specified (tool, views, layout)
- [ ] Review cadence with audience, focus, and decisions for each frequency
- [ ] Decision triggers with explicit thresholds
- [ ] Feedback loop described

### Operational Recommendation Checklist

- [ ] Problem quantified with data (dollar impact)
- [ ] Current state vs proposed state comparison
- [ ] Phased implementation plan with timelines and owners
- [ ] Success metrics with baselines and targets
- [ ] Alternatives considered with tradeoff comparison

---

## Part 6: Common B2B Marketing Metrics Reference

### Funnel Metrics

| Metric | Formula | Good Benchmark (B2B SaaS) |
|--------|---------|--------------------------|
| Meeting Rate | Meetings / Touches | 10-20% for events, 2-5% for digital |
| Meeting → Opp Rate | Opportunities / Meetings | 60-80% |
| Opp Win Rate | Closed Won / Total Opps | 15-25% |
| Pipeline Coverage | Pipeline / Quota | 3-4x |
| Pipeline Velocity | (# Opps × Win Rate × Avg Deal) / Sales Cycle Days | Higher = better |

### Efficiency Metrics

| Metric | Formula | What It Tells You |
|--------|---------|-------------------|
| Pipeline per Touch | Pipeline $ / Total Touches | Channel efficiency; compare across channels |
| Pipeline per Meeting | Pipeline $ / Meetings Booked | Meeting quality; higher = better meetings |
| CAC | Total S&M Spend / New Customers | Acquisition cost; aim for LTV:CAC of 3:1+ |
| Marketing % of Pipeline | Marketing-Sourced Pipeline / Total Pipeline | Healthy range: 30-60% |

### Risk Metrics

| Metric | What to Watch For |
|--------|-------------------|
| Channel Concentration % | Any channel >50% of pipeline = risk |
| Closed Lost Rate | Rising rate may signal targeting or qualification issues |
| Lead Leakage Rate | % of leads that enter funnel but are never worked |
| SLA Compliance | % of leads contacted within agreed timeframe |

---

## Part 7: Tools & How They Fit

### The Typical B2B MOps Stack

| Layer | Tool | Your Role |
|-------|------|-----------|
| **CRM** | Salesforce | Source of truth for pipeline, opps, accounts |
| **Marketing Automation** | Marketo / HubSpot | Campaign execution, lead scoring, nurture programs |
| **Integration** | Workato / Tray.io | Automate workflows between systems (task creation, alerts, data sync) |
| **Data Warehouse** | Snowflake / BigQuery | Central data store for cross-system analysis |
| **BI / Reporting** | Sigma / Tableau / Looker | Dashboard creation and self-serve analytics |
| **Communication** | Slack | Alerts, escalations, async team coordination |

### When to Use What for Analysis

| Scenario | Tool |
|----------|------|
| Quick ad-hoc analysis on a CSV | Python (pandas), Google Sheets, or Excel |
| Building a repeatable dashboard | Sigma/Tableau connected to Snowflake |
| Operational report that AEs use daily | Salesforce Reports & Dashboards |
| Executive monthly review | Slides with screenshots from BI tool |
| Automating alerts/triggers | Workato recipe that monitors SFDC fields and sends Slack notifications |

---

## Final Thought

The best marketing data analysis isn't about fancy charts or sophisticated statistical methods. It's about asking the right questions in the right order:

1. **What happened?** (Descriptive — the funnel table)
2. **Why did it happen?** (Diagnostic — the cross-cuts and drop-off analysis)
3. **What should we do about it?** (Prescriptive — the recommendation)
4. **How will we know it worked?** (Measurement — the reporting framework)

If you can walk through these four questions clearly, with data to back each one up, you'll stand out in any interview or leadership presentation.
