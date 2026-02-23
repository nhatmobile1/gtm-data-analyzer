export const CHART_COLORS = {
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
  surface: "#161b22",
  border: "#30363d",
} as const;

export const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: CHART_COLORS.surface,
    border: `1px solid ${CHART_COLORS.border}`,
    borderRadius: 6,
    fontSize: 12,
    color: CHART_COLORS.text,
  },
  labelStyle: { color: CHART_COLORS.text },
  itemStyle: { color: CHART_COLORS.text },
} as const;

export const CURSOR_STYLE = { fill: "rgba(88, 166, 255, 0.06)" } as const;

export const X_AXIS_PROPS = {
  tick: { fill: CHART_COLORS.textMuted, fontSize: 10, angle: -35, textAnchor: "end" as const },
  axisLine: { stroke: CHART_COLORS.grid },
  tickLine: false,
  interval: 0 as const,
  height: 60,
} as const;

export const Y_AXIS_TICK = {
  fill: CHART_COLORS.textMuted,
  fontSize: 10,
} as const;

export const LEGEND_STYLE = {
  fontSize: 11,
  color: CHART_COLORS.textMuted,
  paddingBottom: 8,
} as const;
