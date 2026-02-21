import type { CsvRow, DetectedColumns, FunnelRow, Totals, DropOffResult } from "./types";
import { analyzeFunnel } from "./analysis";

export function buildDataContext(
  rawData: CsvRow[],
  columns: DetectedColumns,
  funnel: FunnelRow[],
  totals: Totals,
  dropOff: DropOffResult | null
): string {
  // Channel funnel table
  const channelFunnel = columns.channel
    ? analyzeFunnel(rawData, columns, columns.channel)
    : funnel;

  const channelTable = channelFunnel
    .map(
      (r) =>
        `${r.name}: ${r.touches} touches (${r.touchShare.toFixed(1)}%), ${r.meetings} mtgs (${r.mtgRate.toFixed(1)}% rate), ${r.opps} opps (${r.mtgToOpp.toFixed(1)}% mtg→opp), $${Math.round(r.pipeline).toLocaleString()} pipeline (${r.pipelineShare.toFixed(1)}%), $${Math.round(r.pipelinePerTouch).toLocaleString()}/touch, $${Math.round(r.closedWon).toLocaleString()} closed won (${r.winRate.toFixed(1)}% win rate)`
    )
    .join("\n");

  // Dimension summaries (top 4-5)
  const dimSummaries: string[] = [];
  const dimsToSummarize = [
    columns.interactionStatus,
    ...columns.dimensions.slice(0, 4),
  ].filter(Boolean) as string[];

  for (const dim of dimsToSummarize) {
    const df = analyzeFunnel(rawData, columns, dim);
    const rows = df
      .map(
        (r) =>
          `  ${r.name}: ${r.touches} touches, ${r.mtgRate.toFixed(1)}% mtg rate, $${Math.round(r.pipeline).toLocaleString()} pipeline, $${Math.round(r.pipelinePerTouch).toLocaleString()}/touch, $${Math.round(r.closedWon).toLocaleString()} won`
      )
      .join("\n");
    dimSummaries.push(`\n${dim}:\n${rows}`);
  }

  // Drop-off context
  let dropOffCtx = "";
  if (dropOff && dropOff.attended > 0) {
    dropOffCtx = `\nDROP-OFF ANALYSIS:\n${dropOff.attended} engaged contacts (attended/visited/badge scan), ${dropOff.noMeeting} (${((dropOff.noMeeting / dropOff.attended) * 100).toFixed(1)}%) did NOT book a meeting.\n`;
    dropOff.breakdowns.forEach((bd) => {
      dropOffCtx += `${bd.label}: ${Object.entries(bd.data)
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => `${k}=${v}`)
        .join(", ")}\n`;
    });
  }

  return `MARKETING PERFORMANCE DATA SUMMARY (${rawData.length} records):

OVERALL FUNNEL:
${totals.touches.toLocaleString()} touches → ${totals.meetings.toLocaleString()} meetings (${((totals.meetings / totals.touches) * 100).toFixed(1)}%) → ${totals.opps.toLocaleString()} opportunities (${((totals.opps / totals.meetings) * 100).toFixed(1)}% mtg→opp) → $${Math.round(totals.pipeline).toLocaleString()} pipeline → $${Math.round(totals.closedWon).toLocaleString()} closed won

CHANNEL FUNNEL (sorted by pipeline):
${channelTable}

DIMENSION BREAKDOWNS:${dimSummaries.join("")}
${dropOffCtx}
DETECTED FIELDS: Channel=${columns.channel || "none"}, Meeting Booked=${columns.meetingBooked || "none"}, Pipeline=${columns.pipeline || "none"}, Closed Won=${columns.closedWon || "none"}, Opp Stage=${columns.oppStage || "none"}, Interaction Status=${columns.interactionStatus || "none"}
Dimensions available: ${columns.dimensions.join(", ")}`;
}
