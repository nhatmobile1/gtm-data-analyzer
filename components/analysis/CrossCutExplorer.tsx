"use client";

import {
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Line,
  ComposedChart,
} from "recharts";
import type { FunnelRow, VarianceResult } from "@/lib/types";
import {
  formatNumber,
  formatCurrency,
  formatPercent,
  meetingRateColor,
  pipelinePerTouchColor,
} from "@/lib/formatting";
import Callout from "@/components/ui/Callout";
import { CHART_COLORS, TOOLTIP_STYLE, CURSOR_STYLE, LEGEND_STYLE } from "@/lib/chartTheme";

interface CrossCutExplorerProps {
  crossCut: FunnelRow[];
  crossCutDim: string | null;
  variance: VarianceResult | null;
  allDimOptions: string[];
  onDimChange: (dim: string) => void;
}


export default function CrossCutExplorer({
  crossCut,
  crossCutDim,
  variance,
  allDimOptions,
  onDimChange,
}: CrossCutExplorerProps) {
  const headers = [
    crossCutDim || "Dimension",
    "Touches",
    "% Total",
    "Meetings",
    "Mtg Rate",
    "Pipeline",
    "% Pipeline",
    "$/Touch",
    "Won",
    "Avg Deal",
  ];

  return (
    <div style={{ animation: "fade-in 0.3s ease-out both" }}>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="text-muted text-xs">Dimension:</span>
        <select
          value={crossCutDim || ""}
          onChange={(e) => onDimChange(e.target.value)}
          aria-label="Select dimension"
          className="bg-surface border border-border text-text py-1.5 px-3 rounded-md text-xs font-sans"
        >
          {allDimOptions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        {variance && (
          <span
            className={`text-[11px] py-[3px] px-2.5 rounded font-semibold ${
              variance.signal === "strong"
                ? "bg-positive/15 text-positive"
                : variance.signal === "moderate"
                  ? "bg-warning/15 text-warning"
                  : "bg-muted/15 text-muted"
            }`}
          >
            {variance.signal === "strong"
              ? "STRONG SIGNAL"
              : variance.signal === "moderate"
                ? "MODERATE"
                : "LOW VARIANCE"}{" "}
            &mdash; {variance.ratio}x gap
          </span>
        )}
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th
                  key={h}
                  scope="col"
                  className={`${i === 0 ? "text-left" : "text-right"} py-2.5 px-3 text-[10px] uppercase tracking-wide text-muted border-b-2 border-border whitespace-nowrap font-semibold`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {crossCut.map((r) => (
              <tr key={r.name} className="transition-colors hover:bg-surface-hover">
                <td className="py-2.5 px-3 font-medium text-[13px]">
                  {r.name}
                </td>
                <td className="text-right py-2.5 px-3 font-mono text-[13px]">
                  {formatNumber(r.touches)}
                </td>
                <td className="text-right py-2.5 px-3 font-mono text-[13px] text-muted">
                  {formatPercent(r.touchShare)}
                </td>
                <td className="text-right py-2.5 px-3 font-mono text-[13px]">
                  {formatNumber(r.meetings)}
                </td>
                <td
                  className={`text-right py-2.5 px-3 font-mono text-[13px] ${meetingRateColor(r.mtgRate)}`}
                >
                  {formatPercent(r.mtgRate)}
                </td>
                <td className="text-right py-2.5 px-3 font-mono text-[13px] text-accent">
                  {formatCurrency(r.pipeline)}
                </td>
                <td className="text-right py-2.5 px-3 font-mono text-[13px] text-muted">
                  {formatPercent(r.pipelineShare)}
                </td>
                <td
                  className={`text-right py-2.5 px-3 font-mono text-[13px] ${pipelinePerTouchColor(r.pipelinePerTouch)}`}
                >
                  {formatCurrency(r.pipelinePerTouch)}
                </td>
                <td className="text-right py-2.5 px-3 font-mono text-[13px] text-positive">
                  {formatCurrency(r.closedWon)}
                </td>
                <td className="text-right py-2.5 px-3 font-mono text-[13px]">
                  {r.avgDeal > 0 ? formatCurrency(r.avgDeal) : "\u2014"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dual-axis chart */}
      {crossCut.length > 0 && (
        <div className="bg-surface border border-border rounded-lg p-4 mt-4">
          <div className="text-[13px] font-semibold mb-2">
            {crossCutDim}: Efficiency vs Meeting Rate
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={crossCut} margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: CHART_COLORS.textMuted, fontSize: 10 }}
                axisLine={{ stroke: CHART_COLORS.grid }}
                tickLine={false}
                interval={0}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: CHART_COLORS.textMuted, fontSize: 10 }}
                tickFormatter={(v) => formatCurrency(v)}
                axisLine={false}
                tickLine={false}
                label={{
                  value: "$/Touch",
                  angle: -90,
                  position: "insideLeft",
                  fill: CHART_COLORS.textMuted,
                  fontSize: 10,
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: CHART_COLORS.textMuted, fontSize: 10 }}
                tickFormatter={(v) => `${v}%`}
                axisLine={false}
                tickLine={false}
                label={{
                  value: "Mtg Rate %",
                  angle: 90,
                  position: "insideRight",
                  fill: CHART_COLORS.textMuted,
                  fontSize: 10,
                }}
              />
              <Tooltip
                {...TOOLTIP_STYLE}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={LEGEND_STYLE}
              />
              <Bar
                yAxisId="left"
                dataKey="pipelinePerTouch"
                name="Pipeline/Touch"
                fill={CHART_COLORS.accent}
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="mtgRate"
                name="Mtg Rate %"
                stroke={CHART_COLORS.positive}
                strokeWidth={2}
                dot={{ fill: CHART_COLORS.positive, r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      <Callout variant="info">
        <strong className="text-text">How to read this:</strong> The variance
        badge shows the ratio between the best and worst $/Touch values (for
        segments with 20+ touches). A 3x+ gap means this dimension meaningfully
        predicts pipeline performance. Below 1.5x = mostly noise.
      </Callout>
    </div>
  );
}
