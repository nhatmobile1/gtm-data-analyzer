import {
  MEETING_RATE_GREEN,
  MEETING_RATE_RED,
  PIPELINE_PER_TOUCH_GREEN,
  PIPELINE_PER_TOUCH_RED,
  MTG_TO_OPP_GREEN,
  MTG_TO_OPP_RED,
} from "./constants";

export function formatCurrency(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return "\u2014";
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e4) return `$${(n / 1e3).toFixed(0)}K`;
  if (Math.abs(n) >= 1000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  return `$${n.toFixed(0)}`;
}

export function formatNumber(n: number | null | undefined): string {
  if (n == null) return "\u2014";
  return n.toLocaleString("en-US");
}

export function formatPercent(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return "\u2014";
  return `${n.toFixed(1)}%`;
}

export function pct(numerator: number, denominator: number): number {
  return denominator > 0 ? (numerator / denominator) * 100 : 0;
}

// Metric color classes based on B2B benchmarks
export function meetingRateColor(rate: number): string {
  if (rate > MEETING_RATE_GREEN) return "text-positive";
  if (rate < MEETING_RATE_RED) return "text-negative";
  return "text-text";
}

export function pipelinePerTouchColor(ppt: number): string {
  if (ppt > PIPELINE_PER_TOUCH_GREEN) return "text-positive";
  if (ppt < PIPELINE_PER_TOUCH_RED) return "text-negative";
  return "text-text";
}

export function mtgToOppColor(rate: number): string {
  if (rate > MTG_TO_OPP_GREEN) return "text-positive";
  if (rate < MTG_TO_OPP_RED) return "text-negative";
  return "text-text";
}
