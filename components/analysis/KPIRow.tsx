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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 px-4 sm:px-6 py-4">
      {kpis.map((kpi, i) => (
        <div
          key={kpi.label}
          className="bg-surface border border-border rounded-lg py-3 sm:py-[14px] px-4"
          style={{
            animation: `fade-in-up 0.35s ease-out ${i * 0.06}s both`,
          }}
        >
          <div className="text-[10px] uppercase tracking-wider text-muted mb-1">
            {kpi.label}
          </div>
          <div
            className={`text-lg sm:text-[22px] font-bold font-mono ${kpi.color || "text-text"}`}
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
