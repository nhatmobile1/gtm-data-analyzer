"use client";

import type { FunnelRow } from "@/lib/types";
import {
  formatNumber,
  formatCurrency,
  formatPercent,
  meetingRateColor,
  pipelinePerTouchColor,
  mtgToOppColor,
} from "@/lib/formatting";
import Callout from "@/components/ui/Callout";

interface FunnelTableProps {
  funnel: FunnelRow[];
  selectedDim: string;
  allDimOptions: string[];
  onDimChange: (dim: string) => void;
}

export default function FunnelTable({
  funnel,
  selectedDim,
  allDimOptions,
  onDimChange,
}: FunnelTableProps) {
  const headers = [
    selectedDim,
    "Touches",
    "% Total",
    "Meetings",
    "Mtg Rate",
    "Opps",
    "Mtg\u2192Opp",
    "Pipeline",
    "% Pipeline",
    "$/Touch",
    "Won",
    "Win Rate",
  ];

  return (
    <div style={{ animation: "fade-in 0.3s ease-out both" }}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-muted text-xs">Group by:</span>
        <select
          value={selectedDim}
          onChange={(e) => onDimChange(e.target.value)}
          className="bg-surface border border-border text-text py-1.5 px-3 rounded-md text-xs font-sans"
        >
          {allDimOptions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th
                  key={h}
                  className={`${i === 0 ? "text-left" : "text-right"} py-2.5 px-3 text-[10px] uppercase tracking-wide text-muted border-b-2 border-border whitespace-nowrap font-semibold`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {funnel.map((r) => {
              const isTop = r.pipelineShare > 30;
              const isWarn = r.touchShare > 20 && r.pipelineShare < 10;
              return (
                <tr
                  key={r.name}
                  className={`transition-colors hover:bg-surface-hover ${
                    isTop
                      ? "bg-accent/[0.04]"
                      : isWarn
                        ? "bg-negative/[0.03]"
                        : ""
                  }`}
                >
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
                  <td className="text-right py-2.5 px-3 font-mono text-[13px]">
                    {formatNumber(r.opps)}
                  </td>
                  <td
                    className={`text-right py-2.5 px-3 font-mono text-[13px] ${mtgToOppColor(r.mtgToOpp)}`}
                  >
                    {formatPercent(r.mtgToOpp)}
                  </td>
                  <td className="text-right py-2.5 px-3 font-mono text-[13px] text-accent">
                    {formatCurrency(r.pipeline)}
                  </td>
                  <td
                    className={`text-right py-2.5 px-3 font-mono text-[13px] ${r.pipelineShare > 40 ? "text-accent" : "text-muted"}`}
                  >
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
                    {formatPercent(r.winRate)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {funnel.length > 0 && funnel[0].pipelineShare > 50 && (
        <Callout variant="warning">
          <strong className="text-text">Concentration Risk:</strong>{" "}
          {funnel[0].name} accounts for {formatPercent(funnel[0].pipelineShare)}{" "}
          of pipeline. Best practice: no single channel should exceed 50%.
        </Callout>
      )}
    </div>
  );
}
