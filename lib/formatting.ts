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
  if (rate > 15) return "text-positive";
  if (rate < 5) return "text-negative";
  return "text-text";
}

export function pipelinePerTouchColor(ppt: number): string {
  if (ppt > 10000) return "text-positive";
  if (ppt < 2000) return "text-negative";
  return "text-text";
}

export function mtgToOppColor(rate: number): string {
  if (rate > 70) return "text-positive";
  if (rate < 50) return "text-negative";
  return "text-text";
}
