import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  pct,
  meetingRateColor,
  pipelinePerTouchColor,
  mtgToOppColor,
} from "../formatting";

describe("formatCurrency", () => {
  it("returns em dash for null/undefined/NaN", () => {
    expect(formatCurrency(null)).toBe("\u2014");
    expect(formatCurrency(undefined)).toBe("\u2014");
    expect(formatCurrency(NaN)).toBe("\u2014");
  });

  it("formats millions", () => {
    expect(formatCurrency(1_500_000)).toBe("$1.5M");
    expect(formatCurrency(-2_300_000)).toBe("$-2.3M");
  });

  it("formats ten-thousands as K", () => {
    expect(formatCurrency(50_000)).toBe("$50K");
    expect(formatCurrency(10_000)).toBe("$10K");
  });

  it("formats thousands with locale separator", () => {
    expect(formatCurrency(5_432)).toMatch(/^\$5,432$/);
  });

  it("formats small values", () => {
    expect(formatCurrency(500)).toBe("$500");
    expect(formatCurrency(0)).toBe("$0");
  });
});

describe("formatNumber", () => {
  it("returns em dash for null/undefined", () => {
    expect(formatNumber(null)).toBe("\u2014");
    expect(formatNumber(undefined)).toBe("\u2014");
  });

  it("formats with locale separators", () => {
    expect(formatNumber(1234)).toBe("1,234");
    expect(formatNumber(0)).toBe("0");
  });
});

describe("formatPercent", () => {
  it("returns em dash for null/undefined/NaN", () => {
    expect(formatPercent(null)).toBe("\u2014");
    expect(formatPercent(NaN)).toBe("\u2014");
  });

  it("formats with one decimal", () => {
    expect(formatPercent(15.67)).toBe("15.7%");
    expect(formatPercent(0)).toBe("0.0%");
  });
});

describe("pct", () => {
  it("returns percentage", () => {
    expect(pct(1, 4)).toBe(25);
  });

  it("returns 0 for zero denominator", () => {
    expect(pct(5, 0)).toBe(0);
  });
});

describe("meetingRateColor", () => {
  it("returns positive for rates above 15", () => {
    expect(meetingRateColor(20)).toBe("text-positive");
  });

  it("returns negative for rates below 5", () => {
    expect(meetingRateColor(3)).toBe("text-negative");
  });

  it("returns neutral for rates in between", () => {
    expect(meetingRateColor(10)).toBe("text-text");
  });
});

describe("pipelinePerTouchColor", () => {
  it("returns positive for high efficiency", () => {
    expect(pipelinePerTouchColor(15000)).toBe("text-positive");
  });

  it("returns negative for low efficiency", () => {
    expect(pipelinePerTouchColor(1000)).toBe("text-negative");
  });

  it("returns neutral for mid-range", () => {
    expect(pipelinePerTouchColor(5000)).toBe("text-text");
  });
});

describe("mtgToOppColor", () => {
  it("returns positive for high conversion", () => {
    expect(mtgToOppColor(80)).toBe("text-positive");
  });

  it("returns negative for low conversion", () => {
    expect(mtgToOppColor(40)).toBe("text-negative");
  });

  it("returns neutral for mid-range", () => {
    expect(mtgToOppColor(60)).toBe("text-text");
  });
});
