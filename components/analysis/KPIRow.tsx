import type { Totals } from "@/lib/types";
import { formatNumber, formatCurrency, formatPercent, pct } from "@/lib/formatting";

interface KPIRowProps {
  totals: Totals;
}

export default function KPIRow({ totals }: KPIRowProps) {
  const kpis = [
    { label: "Touches", value: formatNumber(totals.touches) },
    {
      label: "Meetings",
      value: formatNumber(totals.meetings),
      sub: `${formatPercent(pct(totals.meetings, totals.touches))} rate`,
    },
    {
      label: "Opportunities",
      value: formatNumber(totals.opps),
      sub: `${formatPercent(pct(totals.opps, totals.meetings))} mtg\u2192opp`,
    },
    {
      label: "Pipeline",
      value: formatCurrency(totals.pipeline),
      color: "text-accent",
    },
    {
      label: "Closed Won",
      value: formatCurrency(totals.closedWon),
      color: "text-positive",
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-3 px-6 py-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="bg-surface border border-border rounded-lg py-[14px] px-4"
        >
          <div className="text-[10px] uppercase tracking-wider text-muted mb-1">
            {kpi.label}
          </div>
          <div
            className={`text-[22px] font-bold font-mono ${kpi.color || "text-text"}`}
          >
            {kpi.value}
          </div>
          {kpi.sub && (
            <div className="text-[11px] text-muted mt-0.5">{kpi.sub}</div>
          )}
        </div>
      ))}
    </div>
  );
}
