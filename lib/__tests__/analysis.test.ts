import { describe, it, expect } from "vitest";
import {
  analyzeFunnel,
  analyzeDropOff,
  calculateVariance,
  calculateTotals,
} from "../analysis";
import type { DetectedColumns, CsvRow, FunnelRow } from "../types";

function makeCols(
  overrides: Partial<DetectedColumns> = {}
): DetectedColumns {
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
    const result = analyzeFunnel(data, makeCols(), "channel");

    expect(result).toHaveLength(2);
    const email = result.find((r) => r.name === "Email")!;
    const events = result.find((r) => r.name === "Events")!;
    expect(email.touches).toBe(2);
    expect(events.touches).toBe(1);
  });

  it("calculates meeting rate correctly", () => {
    const data: CsvRow[] = [
      makeRow({ meeting_booked: "Yes" }),
      makeRow({ meeting_booked: "No" }),
      makeRow({ meeting_booked: "Yes" }),
      makeRow({ meeting_booked: "No" }),
    ];
    const result = analyzeFunnel(data, makeCols(), "channel");

    expect(result[0].meetings).toBe(2);
    expect(result[0].mtgRate).toBe(50);
  });

  it("sorts by pipeline descending", () => {
    const data: CsvRow[] = [
      makeRow({ channel: "Email", pipeline: "1000" }),
      makeRow({ channel: "Events", pipeline: "5000" }),
    ];
    const result = analyzeFunnel(data, makeCols(), "channel");

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
    const result = analyzeFunnel(data, makeCols(), "channel");
    expect(result[0].name).toBe("(blank)");
  });

  it("calculates pipeline share correctly", () => {
    const data: CsvRow[] = [
      makeRow({ channel: "A", pipeline: "300" }),
      makeRow({ channel: "B", pipeline: "700" }),
    ];
    const result = analyzeFunnel(data, makeCols(), "channel");

    expect(result[0].pipelineShare).toBe(70); // B=700/1000
    expect(result[1].pipelineShare).toBe(30);
  });

  it("calculates win rate and avg deal", () => {
    const data: CsvRow[] = [
      makeRow({ closed_won: "10000", opp_id: "O1" }),
      makeRow({ closed_won: "20000", opp_id: "O2" }),
      makeRow({ closed_won: "0", opp_id: "O3" }),
    ];
    const result = analyzeFunnel(data, makeCols(), "channel");

    expect(result[0].wonCount).toBe(2);
    expect(result[0].avgDeal).toBe(15000);
  });
});

describe("analyzeDropOff", () => {
  it("returns null if no interactionStatus column", () => {
    const result = analyzeDropOff([], makeCols({ interactionStatus: null }));
    expect(result).toBeNull();
  });

  it("returns null if no meetingBooked column", () => {
    const result = analyzeDropOff([], makeCols({ meetingBooked: null }));
    expect(result).toBeNull();
  });

  it("counts attended contacts without meetings", () => {
    const data: CsvRow[] = [
      makeRow({ status: "Attended", meeting_booked: "No" }),
      makeRow({ status: "Attended", meeting_booked: "Yes" }),
      makeRow({ status: "Visited Booth", meeting_booked: "No" }),
      makeRow({ status: "Registered", meeting_booked: "No" }),
    ];
    const result = analyzeDropOff(data, makeCols());

    expect(result).not.toBeNull();
    expect(result!.attended).toBe(3); // Attended x2 + Visited
    expect(result!.noMeeting).toBe(2); // Attended No + Visited No
  });

  it("includes channel breakdown when channel column exists", () => {
    const data: CsvRow[] = [
      makeRow({ status: "Attended", meeting_booked: "No", channel: "Email" }),
      makeRow({ status: "Attended", meeting_booked: "No", channel: "Events" }),
    ];
    const result = analyzeDropOff(data, makeCols());

    expect(result!.breakdowns.length).toBeGreaterThan(0);
    expect(result!.breakdowns[0].label).toBe("By Channel");
  });
});

describe("calculateVariance", () => {
  it("returns STRONG for 3x+ gap", () => {
    const rows = [
      { name: "A", touches: 100, pipelinePerTouch: 9000 } as FunnelRow,
      { name: "B", touches: 50, pipelinePerTouch: 3000 } as FunnelRow,
    ];
    const result = calculateVariance(rows);

    expect(result).not.toBeNull();
    expect(result!.signal).toBe("strong");
    expect(result!.ratio).toBe(3);
  });

  it("returns MODERATE for 1.5x-3x gap", () => {
    const rows = [
      { name: "A", touches: 100, pipelinePerTouch: 2000 } as FunnelRow,
      { name: "B", touches: 50, pipelinePerTouch: 1000 } as FunnelRow,
    ];
    const result = calculateVariance(rows);

    expect(result).not.toBeNull();
    expect(result!.signal).toBe("moderate");
  });

  it("returns LOW for <1.5x gap", () => {
    const rows = [
      { name: "A", touches: 100, pipelinePerTouch: 1200 } as FunnelRow,
      { name: "B", touches: 50, pipelinePerTouch: 1000 } as FunnelRow,
    ];
    const result = calculateVariance(rows);

    expect(result).not.toBeNull();
    expect(result!.signal).toBe("low");
  });

  it("filters out segments below minTouches", () => {
    const rows = [
      { name: "Big", touches: 100, pipelinePerTouch: 9000 } as FunnelRow,
      { name: "Tiny", touches: 5, pipelinePerTouch: 1 } as FunnelRow,
    ];
    const result = calculateVariance(rows);
    expect(result).toBeNull(); // Only 1 qualifying segment
  });

  it("returns null for fewer than 2 qualifying segments", () => {
    const rows = [
      { name: "A", touches: 100, pipelinePerTouch: 5000 } as FunnelRow,
    ];
    expect(calculateVariance(rows)).toBeNull();
  });

  it("returns null for all-zero pipelinePerTouch", () => {
    const rows = [
      { name: "A", touches: 100, pipelinePerTouch: 0 } as FunnelRow,
      { name: "B", touches: 50, pipelinePerTouch: 0 } as FunnelRow,
    ];
    expect(calculateVariance(rows)).toBeNull();
  });
});

describe("calculateTotals", () => {
  it("sums all funnel row fields", () => {
    const rows = [
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

  it("handles empty array", () => {
    const totals = calculateTotals([]);
    expect(totals.touches).toBe(0);
    expect(totals.pipeline).toBe(0);
  });
});
