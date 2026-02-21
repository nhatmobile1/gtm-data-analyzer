import type {
  CsvRow,
  DetectedColumns,
  FunnelRow,
  DropOffResult,
  VarianceResult,
  Totals,
} from "./types";
import { pct } from "./formatting";

// --- Internal helpers ---

function groupBy<T>(arr: T[], fn: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of arr) {
    const key = fn(item);
    (result[key] || (result[key] = [])).push(item);
  }
  return result;
}

function sumBy<T>(arr: T[], fn: (item: T) => number): number {
  let s = 0;
  for (const item of arr) s += fn(item) || 0;
  return s;
}

function countBy<T>(arr: T[], fn: (item: T) => string): Record<string, number> {
  const result: Record<string, number> = {};
  for (const item of arr) {
    const key = fn(item);
    result[key] = (result[key] || 0) + 1;
  }
  return result;
}

// --- Public API ---

export function analyzeFunnel(
  data: CsvRow[],
  cols: DetectedColumns,
  dimensionField: string
): FunnelRow[] {
  const groups = groupBy(data, (r) => r[dimensionField] || "(blank)");

  const rows = Object.entries(groups).map(([key, items]) => {
    const touches = items.length;
    const meetings = cols.meetingBooked
      ? items.filter(
          (r) => String(r[cols.meetingBooked!]).toLowerCase() === "yes"
        ).length
      : 0;
    const opps = cols.oppId
      ? items.filter((r) => r[cols.oppId!]).length
      : 0;
    const pipeline = cols.pipeline
      ? sumBy(items, (r) => parseFloat(r[cols.pipeline!]) || 0)
      : 0;
    const closedWon = cols.closedWon
      ? sumBy(items, (r) => parseFloat(r[cols.closedWon!]) || 0)
      : 0;
    const wonCount = cols.closedWon
      ? items.filter((r) => parseFloat(r[cols.closedWon!]) > 0).length
      : 0;
    const closedLost = cols.oppStage
      ? items.filter((r) =>
          String(r[cols.oppStage!]).toLowerCase().includes("lost")
        ).length
      : 0;

    return {
      name: key,
      touches,
      meetings,
      opps,
      pipeline,
      closedWon,
      wonCount,
      closedLost,
      mtgRate: pct(meetings, touches),
      mtgToOpp: pct(opps, meetings),
      pipelinePerTouch: touches > 0 ? pipeline / touches : 0,
      pipelinePerMeeting: meetings > 0 ? pipeline / meetings : 0,
      winRate: opps > 0 ? pct(wonCount, opps) : 0,
      avgDeal: wonCount > 0 ? closedWon / wonCount : 0,
      pipelineShare: 0,
      touchShare: 0,
    };
  });

  // Sort by pipeline descending
  rows.sort((a, b) => b.pipeline - a.pipeline);

  // Calculate shares
  const totalPipeline = sumBy(rows, (r) => r.pipeline);
  const totalTouches = sumBy(rows, (r) => r.touches);

  rows.forEach((row) => {
    row.pipelineShare = pct(row.pipeline, totalPipeline);
    row.touchShare = pct(row.touches, totalTouches);
  });

  return rows;
}

export function analyzeDropOff(
  data: CsvRow[],
  cols: DetectedColumns
): DropOffResult | null {
  if (!cols.interactionStatus || !cols.meetingBooked) return null;

  const attended = data.filter((r) => {
    const status = String(r[cols.interactionStatus!]).toLowerCase();
    return (
      status.includes("attended") ||
      status.includes("visited") ||
      status.includes("badge")
    );
  });

  const noMeeting = attended.filter(
    (r) => String(r[cols.meetingBooked!]).toLowerCase() !== "yes"
  );

  const breakdowns: DropOffResult["breakdowns"] = [];

  if (cols.channel) {
    const byChannel = countBy(noMeeting, (r) => r[cols.channel!]);
    breakdowns.push({
      label: "By Channel",
      data: byChannel,
      total: noMeeting.length,
    });
  }

  cols.dimensions.forEach((dim) => {
    const byDim = countBy(noMeeting, (r) => r[dim] || "(blank)");
    if (Object.keys(byDim).length >= 2 && Object.keys(byDim).length <= 15) {
      breakdowns.push({
        label: `By ${dim}`,
        data: byDim,
        total: noMeeting.length,
      });
    }
  });

  return {
    attended: attended.length,
    noMeeting: noMeeting.length,
    breakdowns,
  };
}

export function calculateVariance(
  crossCutResults: FunnelRow[],
  minTouches: number = 20
): VarianceResult | null {
  const rates = crossCutResults
    .filter((r) => r.touches >= minTouches)
    .map((r) => r.pipelinePerTouch);

  if (rates.length < 2) return null;

  const max = Math.max(...rates);
  const positiveRates = rates.filter((r) => r > 0);
  if (positiveRates.length === 0) return null;

  const min = Math.min(...positiveRates);
  if (min <= 0) return null;

  const ratio = parseFloat((max / min).toFixed(1));

  let signal: VarianceResult["signal"];
  if (ratio >= 3) signal = "strong";
  else if (ratio >= 1.5) signal = "moderate";
  else signal = "low";

  return { ratio, signal };
}

export function calculateTotals(funnel: FunnelRow[]): Totals {
  return {
    touches: sumBy(funnel, (r) => r.touches),
    meetings: sumBy(funnel, (r) => r.meetings),
    opps: sumBy(funnel, (r) => r.opps),
    pipeline: sumBy(funnel, (r) => r.pipeline),
    closedWon: sumBy(funnel, (r) => r.closedWon),
  };
}
