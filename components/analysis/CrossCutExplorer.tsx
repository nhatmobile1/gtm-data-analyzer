"use client";

import {
  BarChart,
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

interface CrossCutExplorerProps {
  crossCut: FunnelRow[];
  crossCutDim: string | null;
  variance: VarianceResult | null;
  allDimOptions: string[];
  onDimChange: (dim: string) => void;
}

const CHART_COLORS = {
  accent: "#58a6ff",
  positive: "#3fb950",
  textMuted: "#8b949e",
  grid: "#21262d",
};

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
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-muted text-xs">Dimension:</span>
        <select
          value={crossCutDim || ""}
          onChange={(e) => onDimChange(e.target.value)}
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
            className={`text-[11px] py-[3px] px-[10px] rounded-full font-semibold ${
              variance.signal === "strong"
                ? "bg-positive/15 text-positive"
                : variance.signal === "moderate"
                  ? "bg-warning/15 text-warning"
                  : "bg-muted/15 text-muted"
            }`}
          >
            {variance.signal === "strong"
              ? "\ud83d\udfe2 STRONG SIGNAL"
              : variance.signal === "moderate"
                ? "\ud83d\udfe1 MODERATE"
                : "\ud83d\udd07 LOW VARIANCE"}{" "}
            \u2014 {variance.ratio}x gap
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
                  className={`${i === 0 ? "text-left" : "text-right"} py-[10px] px-3 text-[10px] uppercase tracking-wide text-muted border-b-2 border-border whitespace-nowrap font-semibold`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {crossCut.map((r) => (
              <tr key={r.name}>
                <td className="py-[10px] px-3 font-medium text-[13px]">
                  {r.name}
                </td>
                <td className="text-right py-[10px] px-3 font-mono text-[13px]">
                  {formatNumber(r.touches)}
                </td>
                <td className="text-right py-[10px] px-3 font-mono text-[13px] text-muted">
                  {formatPercent(r.touchShare)}
                </td>
                <td className="text-right py-[10px] px-3 font-mono text-[13px]">
                  {formatNumber(r.meetings)}
                </td>
                <td
                  className={`text-right py-[10px] px-3 font-mono text-[13px] ${meetingRateColor(r.mtgRate)}`}
                >
                  {formatPercent(r.mtgRate)}
                </td>
                <td className="text-right py-[10px] px-3 font-mono text-[13px] text-accent">
                  {formatCurrency(r.pipeline)}
                </td>
                <td className="text-right py-[10px] px-3 font-mono text-[13px] text-muted">
                  {formatPercent(r.pipelineShare)}
                </td>
                <td
                  className={`text-right py-[10px] px-3 font-mono text-[13px] ${pipelinePerTouchColor(r.pipelinePerTouch)}`}
                >
                  {formatCurrency(r.pipelinePerTouch)}
                </td>
                <td className="text-right py-[10px] px-3 font-mono text-[13px] text-positive">
                  {formatCurrency(r.closedWon)}
                </td>
                <td className="text-right py-[10px] px-3 font-mono text-[13px]">
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
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={crossCut} margin={{ bottom: 60 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: CHART_COLORS.textMuted, fontSize: 10 }}
                angle={-35}
                textAnchor="end"
                axisLine={{ stroke: CHART_COLORS.grid }}
                tickLine={false}
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
                contentStyle={{
                  backgroundColor: "#161b22",
                  border: "1px solid #30363d",
                  borderRadius: 6,
                  fontSize: 12,
                  color: "#e6edf3",
                }}
              />
              <Legend
                verticalAlign="bottom"
                wrapperStyle={{ fontSize: 11, color: CHART_COLORS.textMuted }}
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
