"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  ReferenceLine,
  LabelList,
} from "recharts";
import type { FunnelRow, Totals } from "@/lib/types";
import { formatCurrency } from "@/lib/formatting";
import { CHART_COLORS, TOOLTIP_STYLE, CURSOR_STYLE, X_AXIS_PROPS, Y_AXIS_TICK, LEGEND_STYLE } from "@/lib/chartTheme";

interface ChartsProps {
  funnel: FunnelRow[];
  totals: Totals;
  selectedDim: string;
}


function pipelineColor(share: number): string {
  if (share > 40) return CHART_COLORS.accent;
  if (share < 5) return CHART_COLORS.muted;
  return CHART_COLORS.accentDark;
}

function mtgRateColor(rate: number): string {
  if (rate > 15) return CHART_COLORS.positive;
  if (rate < 5) return CHART_COLORS.negative;
  return CHART_COLORS.textMuted;
}

function pptColor(ppt: number): string {
  if (ppt > 10000) return CHART_COLORS.positive;
  if (ppt < 2000) return CHART_COLORS.negative;
  return CHART_COLORS.accentDark;
}


export default function Charts({ funnel, totals, selectedDim }: ChartsProps) {
  const wonCount = funnel.reduce((s, r) => s + r.wonCount, 0);

  // Filter out empty-name segments
  const chartData = funnel.filter((r) => r.name && r.name.trim() !== "");

  const funnelData = [
    { name: "Touches", value: totals.touches, fill: CHART_COLORS.accent },
    { name: "Meetings", value: totals.meetings, fill: CHART_COLORS.accentDark },
    { name: "Opportunities", value: totals.opps, fill: CHART_COLORS.nurture },
    { name: "Closed Won", value: wonCount, fill: CHART_COLORS.positive },
  ];

  return (
    <div style={{ animation: "fade-in 0.3s ease-out both" }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pipeline Distribution */}
        <div
          className="bg-surface border border-border rounded-lg p-4"
          style={{ animation: "fade-in-up 0.4s ease-out both" }}
        >
          <div className="text-[13px] font-semibold mb-2">
            Pipeline by {selectedDim}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
              <XAxis dataKey="name" {...X_AXIS_PROPS} />
              <YAxis
                tick={Y_AXIS_TICK}
                tickFormatter={(v) => formatCurrency(v)}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                {...TOOLTIP_STYLE}
                cursor={CURSOR_STYLE}
                formatter={(value) => [formatCurrency(Number(value)), "Pipeline"]}
              />
              <Bar dataKey="pipeline" radius={[4, 4, 0, 0]} animationDuration={800}>
                {chartData.map((r) => (
                  <Cell key={r.name} fill={pipelineColor(r.pipelineShare)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Touch vs Pipeline Share */}
        <div
          className="bg-surface border border-border rounded-lg p-4"
          style={{ animation: "fade-in-up 0.4s ease-out 0.08s both" }}
        >
          <div className="text-[13px] font-semibold mb-2">
            Touch % vs Pipeline % (Misalignment)
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
              <XAxis dataKey="name" {...X_AXIS_PROPS} />
              <YAxis
                tick={Y_AXIS_TICK}
                tickFormatter={(v) => `${v}%`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                {...TOOLTIP_STYLE}
                cursor={CURSOR_STYLE}
                formatter={(value, name) => [
                  `${Number(value).toFixed(1)}%`,
                  name,
                ]}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={LEGEND_STYLE}
              />
              <Bar
                dataKey="touchShare"
                name="% of Touches"
                fill={CHART_COLORS.warning}
                radius={[4, 4, 0, 0]}
                animationDuration={800}
              />
              <Bar
                dataKey="pipelineShare"
                name="% of Pipeline"
                fill={CHART_COLORS.accent}
                radius={[4, 4, 0, 0]}
                animationDuration={800}
                animationBegin={200}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Meeting Rate */}
        <div
          className="bg-surface border border-border rounded-lg p-4"
          style={{ animation: "fade-in-up 0.4s ease-out 0.16s both" }}
        >
          <div className="text-[13px] font-semibold mb-2">
            Meeting Rate by {selectedDim}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
              <XAxis dataKey="name" {...X_AXIS_PROPS} />
              <YAxis
                tick={Y_AXIS_TICK}
                tickFormatter={(v) => `${v}%`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                {...TOOLTIP_STYLE}
                cursor={CURSOR_STYLE}
                formatter={(value) => [`${Number(value).toFixed(1)}%`, "Mtg Rate"]}
              />
              <ReferenceLine
                y={15}
                stroke={CHART_COLORS.positive}
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{
                  value: "15% benchmark",
                  position: "right",
                  fill: CHART_COLORS.positive,
                  fontSize: 10,
                }}
              />
              <Bar dataKey="mtgRate" radius={[4, 4, 0, 0]} animationDuration={800}>
                {chartData.map((r) => (
                  <Cell key={r.name} fill={mtgRateColor(r.mtgRate)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline Per Touch */}
        <div
          className="bg-surface border border-border rounded-lg p-4"
          style={{ animation: "fade-in-up 0.4s ease-out 0.24s both" }}
        >
          <div className="text-[13px] font-semibold mb-2">
            Pipeline per Touch (Efficiency)
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
              <XAxis dataKey="name" {...X_AXIS_PROPS} />
              <YAxis
                tick={Y_AXIS_TICK}
                tickFormatter={(v) => formatCurrency(v)}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                {...TOOLTIP_STYLE}
                cursor={CURSOR_STYLE}
                formatter={(value) => [formatCurrency(Number(value)), "$/Touch"]}
              />
              <Bar dataKey="pipelinePerTouch" radius={[4, 4, 0, 0]} animationDuration={800}>
                {chartData.map((r) => (
                  <Cell key={r.name} fill={pptColor(r.pipelinePerTouch)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Funnel Flow — Horizontal Bars */}
      <div
        className="bg-surface border border-border rounded-lg p-4 mt-4"
        style={{ animation: "fade-in-up 0.4s ease-out 0.32s both" }}
      >
        <div className="text-[13px] font-semibold mb-2">
          Overall Funnel Flow
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={funnelData}
            layout="vertical"
            margin={{ top: 5, right: 80, bottom: 5, left: 10 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: CHART_COLORS.text, fontSize: 13, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              width={110}
            />
            <Tooltip
              {...TOOLTIP_STYLE}
              cursor={CURSOR_STYLE}
              formatter={(value) => [Number(value).toLocaleString(), "Count"]}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} animationDuration={800}>
              {funnelData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                fill={CHART_COLORS.textMuted}
                fontSize={12}
                formatter={(value) => Number(value).toLocaleString()}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 px-2">
          {funnelData.slice(0, -1).map((stage, i) => {
            const next = funnelData[i + 1];
            const rate =
              stage.value > 0
                ? ((next.value / stage.value) * 100).toFixed(1)
                : "0";
            return (
              <div key={stage.name} className="text-xs text-muted">
                {stage.name} → {next.name}:{" "}
                <span className="text-text font-semibold">{rate}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
