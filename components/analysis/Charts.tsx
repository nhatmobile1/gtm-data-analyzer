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
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";
import type { FunnelRow, Totals } from "@/lib/types";
import { formatCurrency } from "@/lib/formatting";

interface ChartsProps {
  funnel: FunnelRow[];
  totals: Totals;
  selectedDim: string;
}

const CHART_COLORS = {
  accent: "#58a6ff",
  accentDark: "#1f6feb",
  positive: "#3fb950",
  negative: "#f85149",
  warning: "#d29922",
  muted: "#30363d",
  nurture: "#bc8cff",
  text: "#e6edf3",
  textMuted: "#8b949e",
  grid: "#21262d",
};

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

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "#161b22",
    border: "1px solid #30363d",
    borderRadius: 6,
    fontSize: 12,
    color: "#e6edf3",
  },
};

export default function Charts({ funnel, totals, selectedDim }: ChartsProps) {
  const wonCount = funnel.reduce((s, r) => s + r.wonCount, 0);

  const funnelData = [
    { name: "Touches", value: totals.touches, fill: CHART_COLORS.accent },
    { name: "Meetings", value: totals.meetings, fill: CHART_COLORS.accentDark },
    { name: "Opportunities", value: totals.opps, fill: CHART_COLORS.nurture },
    { name: "Closed Won", value: wonCount, fill: CHART_COLORS.positive },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        {/* Pipeline Distribution */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-[13px] font-semibold mb-2">
            Pipeline by {selectedDim}
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={funnel} margin={{ bottom: 60 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: CHART_COLORS.textMuted, fontSize: 10 }}
                angle={-35}
                textAnchor="end"
                axisLine={{ stroke: CHART_COLORS.grid }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: CHART_COLORS.textMuted, fontSize: 10 }}
                tickFormatter={(v) => formatCurrency(v)}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                {...tooltipStyle}
                formatter={(value) => [formatCurrency(Number(value)), "Pipeline"]}
              />
              <Bar dataKey="pipeline" radius={[4, 4, 0, 0]}>
                {funnel.map((r) => (
                  <Cell key={r.name} fill={pipelineColor(r.pipelineShare)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Touch vs Pipeline Share */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-[13px] font-semibold mb-2">
            Touch % vs Pipeline % (Misalignment)
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={funnel} margin={{ bottom: 60 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: CHART_COLORS.textMuted, fontSize: 10 }}
                angle={-35}
                textAnchor="end"
                axisLine={{ stroke: CHART_COLORS.grid }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: CHART_COLORS.textMuted, fontSize: 10 }}
                tickFormatter={(v) => `${v}%`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                {...tooltipStyle}
                formatter={(value, name) => [
                  `${Number(value).toFixed(1)}%`,
                  name,
                ]}
              />
              <Legend
                verticalAlign="bottom"
                wrapperStyle={{ fontSize: 11, color: CHART_COLORS.textMuted }}
              />
              <Bar
                dataKey="touchShare"
                name="% of Touches"
                fill={CHART_COLORS.warning}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="pipelineShare"
                name="% of Pipeline"
                fill={CHART_COLORS.accent}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Meeting Rate */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-[13px] font-semibold mb-2">
            Meeting Rate by {selectedDim}
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={funnel} margin={{ bottom: 60 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: CHART_COLORS.textMuted, fontSize: 10 }}
                angle={-35}
                textAnchor="end"
                axisLine={{ stroke: CHART_COLORS.grid }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: CHART_COLORS.textMuted, fontSize: 10 }}
                tickFormatter={(v) => `${v}%`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                {...tooltipStyle}
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
              <Bar dataKey="mtgRate" radius={[4, 4, 0, 0]}>
                {funnel.map((r) => (
                  <Cell key={r.name} fill={mtgRateColor(r.mtgRate)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline Per Touch */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-[13px] font-semibold mb-2">
            Pipeline per Touch (Efficiency)
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={funnel} margin={{ bottom: 60 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: CHART_COLORS.textMuted, fontSize: 10 }}
                angle={-35}
                textAnchor="end"
                axisLine={{ stroke: CHART_COLORS.grid }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: CHART_COLORS.textMuted, fontSize: 10 }}
                tickFormatter={(v) => formatCurrency(v)}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                {...tooltipStyle}
                formatter={(value) => [formatCurrency(Number(value)), "$/Touch"]}
              />
              <Bar dataKey="pipelinePerTouch" radius={[4, 4, 0, 0]}>
                {funnel.map((r) => (
                  <Cell key={r.name} fill={pptColor(r.pipelinePerTouch)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Funnel Waterfall */}
      <div className="bg-surface border border-border rounded-lg p-4 mt-4">
        <div className="text-[13px] font-semibold mb-2">
          Overall Funnel Flow
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <FunnelChart>
            <Tooltip
              {...tooltipStyle}
              formatter={(value) => [Number(value).toLocaleString(), "Count"]}
            />
            <Funnel dataKey="value" data={funnelData} isAnimationActive>
              <LabelList
                position="right"
                fill={CHART_COLORS.text}
                fontSize={12}
                formatter={(value) => Number(value).toLocaleString()}
              />
              <LabelList
                position="center"
                fill={CHART_COLORS.text}
                fontSize={13}
                fontWeight={600}
                dataKey="name"
              />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
