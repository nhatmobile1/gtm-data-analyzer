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

const STANDARD_HEADERS = [
  "Campaign Member ID",
  "Contact ID",
  "Channel",
  "Campaign Name",
  "Meeting Booked",
  "Opportunity ID",
  "Pipeline Revenue Share",
  "Closed Won Revenue",
  "Opportunity Stage",
  "Interaction Status",
  "Account Tier",
];

describe("detectColumns", () => {
  const samples = [
    makeSample(),
    makeSample({ "Meeting Booked": "Yes", "Account Tier": "Mid-Market" }),
  ];

  it("detects all standard column roles", () => {
    const result = detectColumns(STANDARD_HEADERS, samples);

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
    const result = detectColumns(STANDARD_HEADERS, manySamples);
    expect(result.dimensions).toContain("Account Tier");
  });

  it("excludes numeric columns from dimensions", () => {
    const headers = ["id", "Score"];
    const numSamples = [
      { id: "1", Score: "95" },
      { id: "2", Score: "87" },
    ];
    const result = detectColumns(headers, numSamples);
    expect(result.dimensions).not.toContain("Score");
  });

  it("excludes columns with too many unique values from dimensions", () => {
    const headers = ["id", "Description"];
    const uniqueSamples = Array.from({ length: 50 }, (_, i) => ({
      id: String(i),
      Description: `Unique description ${i}`,
    }));
    const result = detectColumns(headers, uniqueSamples);
    expect(result.dimensions).not.toContain("Description");
  });

  it("excludes columns with only 1 unique value from dimensions", () => {
    const headers = ["id", "Region"];
    const singleSamples = Array.from({ length: 10 }, (_, i) => ({
      id: String(i),
      Region: "North America",
    }));
    const result = detectColumns(headers, singleSamples);
    expect(result.dimensions).not.toContain("Region");
  });

  it("handles empty headers", () => {
    const result = detectColumns([], []);
    expect(result.channel).toBeNull();
    expect(result.pipeline).toBeNull();
    expect(result.dimensions).toEqual([]);
  });

  it("detects meetingBooked only when values are yes/no/true/false", () => {
    const headers = ["Meeting Booked"];
    const textSamples = [
      { "Meeting Booked": "Scheduled" },
      { "Meeting Booked": "Pending" },
    ];
    const result = detectColumns(headers, textSamples);
    expect(result.meetingBooked).toBeNull();
  });
});
