import type { DetectedColumns, CsvRow } from "./types";

export function detectColumns(
  headers: string[],
  sampleRows: CsvRow[]
): DetectedColumns {
  const result: DetectedColumns = {
    id: null,
    contactId: null,
    channel: null,
    campaign: null,
    meetingBooked: null,
    oppId: null,
    pipeline: null,
    closedWon: null,
    oppStage: null,
    interactionStatus: null,
    dimensions: [],
  };

  const lower = headers.map((h) =>
    h.toLowerCase().replace(/[^a-z0-9]/g, "")
  );

  headers.forEach((h, i) => {
    const l = lower[i];

    if (
      !result.id &&
      (l.includes("memberid") ||
        l.includes("campaignmemberid") ||
        (l.includes("id") && i === 0))
    ) {
      result.id = h;
    } else if (!result.contactId && l.includes("contactid")) {
      result.contactId = h;
    } else if (
      !result.channel &&
      (l.includes("channel") || l.includes("source") || l.includes("medium"))
    ) {
      result.channel = h;
    } else if (
      !result.campaign &&
      l.includes("campaign") &&
      !l.includes("member")
    ) {
      result.campaign = h;
    } else if (
      !result.meetingBooked &&
      (l.includes("meetingbooked") || l.includes("meeting"))
    ) {
      const vals = sampleRows.map((r) => String(r[h]).toLowerCase());
      if (
        vals.some(
          (v) => v === "yes" || v === "no" || v === "true" || v === "false"
        )
      ) {
        result.meetingBooked = h;
      }
    } else if (
      !result.pipeline &&
      (l.includes("pipeline") ||
        (l.includes("revenue") && l.includes("share")))
    ) {
      result.pipeline = h;
    } else if (
      !result.closedWon &&
      (l.includes("closedwon") ||
        l.includes("woncarr") ||
        l.includes("wonarr") ||
        (l.includes("closed") && l.includes("won")))
    ) {
      result.closedWon = h;
    } else if (
      !result.oppStage &&
      (l.includes("opportunitystage") ||
        l.includes("oppstage") ||
        l.includes("stage"))
    ) {
      result.oppStage = h;
    } else if (
      !result.oppId &&
      (l.includes("opportunityid") || l.includes("oppid"))
    ) {
      result.oppId = h;
    } else if (
      !result.interactionStatus &&
      (l.includes("interaction") ||
        (l.includes("status") && !l.includes("opp")))
    ) {
      result.interactionStatus = h;
    }
  });

  // Detect dimensions: categorical columns with 2-40 unique values
  headers.forEach((h) => {
    const assignedValues = Object.values(result).filter(
      (v) => typeof v === "string"
    );
    if (assignedValues.includes(h)) return;
    if (result.dimensions.includes(h)) return;

    const vals = sampleRows.map((r) => r[h]).filter(Boolean);
    const unique = new Set(vals);
    const isNumeric = vals.every((v) => !isNaN(parseFloat(v)));

    if (!isNumeric && unique.size >= 2 && unique.size <= 40 && vals.length > 0) {
      result.dimensions.push(h);
    }
  });

  return result;
}
