import { Search } from "lucide-react";
import type { DropOffResult, Totals } from "@/lib/types";
import { formatNumber, formatPercent, formatCurrency, pct } from "@/lib/formatting";
import { RECOVERY_RATE } from "@/lib/constants";
import Callout from "@/components/ui/Callout";

interface DropOffAnalysisProps {
  dropOff: DropOffResult | null;
  totals: Totals | null;
}

export default function DropOffAnalysis({
  dropOff,
  totals,
}: DropOffAnalysisProps) {
  if (!dropOff || dropOff.attended === 0) {
    return (
      <div className="py-10 text-center text-muted" style={{ animation: "fade-in 0.3s ease-out both" }}>
        <Search size={32} className="mx-auto mb-3 text-muted" />
        <p className="max-w-md mx-auto">
          Drop-off analysis requires an <strong className="text-text">Interaction Status</strong> field
          (with values like &quot;Attended&quot;, &quot;Visited Booth&quot;, etc.) and a{" "}
          <strong className="text-text">Meeting Booked</strong> field. Check the Field Mapping tab to
          verify detection.
        </p>
      </div>
    );
  }

  const recoveryPipeline =
    totals && totals.meetings > 0
      ? Math.round(dropOff.noMeeting * RECOVERY_RATE) *
        (totals.pipeline / totals.meetings)
      : null;

  return (
    <div style={{ animation: "fade-in 0.3s ease-out both" }}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div
          className="bg-surface border border-border rounded-lg p-4"
          style={{ animation: "fade-in-up 0.35s ease-out both" }}
        >
          <div className="text-[10px] uppercase tracking-wider text-muted mb-1">
            Engaged Contacts
          </div>
          <div className="text-2xl sm:text-[28px] font-bold font-mono">
            {formatNumber(dropOff.attended)}
          </div>
          <div className="text-[11px] text-muted">
            Attended / Visited / Badge Scan
          </div>
        </div>
        <div
          className="bg-surface border border-border rounded-lg p-4"
          style={{ animation: "fade-in-up 0.35s ease-out 0.06s both" }}
        >
          <div className="text-[10px] uppercase tracking-wider text-negative mb-1">
            Dropped Without Meeting
          </div>
          <div className="text-2xl sm:text-[28px] font-bold font-mono text-negative">
            {formatNumber(dropOff.noMeeting)}
          </div>
          <div className="text-[11px] text-muted">
            {formatPercent(pct(dropOff.noMeeting, dropOff.attended))} of engaged
            contacts
          </div>
        </div>
        <div
          className="bg-surface border border-border rounded-lg p-4"
          style={{ animation: "fade-in-up 0.35s ease-out 0.12s both" }}
        >
          <div className="text-[10px] uppercase tracking-wider text-positive mb-1">
            Estimated Pipeline if 10% Recovered
          </div>
          <div className="text-2xl sm:text-[28px] font-bold font-mono text-positive">
            {recoveryPipeline != null
              ? formatCurrency(recoveryPipeline)
              : "\u2014"}
          </div>
          <div className="text-[11px] text-muted">
            Based on avg pipeline/meeting
          </div>
        </div>
      </div>

      {/* Breakdown Tables */}
      <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
        {dropOff.breakdowns.map((bd) => (
          <div
            key={bd.label}
            className="bg-surface border border-border rounded-lg overflow-hidden"
          >
            <div className="py-2.5 px-3.5 border-b border-border text-xs font-semibold text-nurture">
              {bd.label}
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-2 px-3.5 text-[10px] uppercase text-muted border-b border-border">
                    Segment
                  </th>
                  <th className="text-right py-2 px-3.5 text-[10px] uppercase text-muted border-b border-border">
                    Count
                  </th>
                  <th className="text-right py-2 px-3.5 text-[10px] uppercase text-muted border-b border-border">
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(bd.data)
                  .sort((a, b) => b[1] - a[1])
                  .map(([seg, count]) => (
                    <tr key={seg} className="transition-colors hover:bg-surface-hover">
                      <td className="py-2 px-3.5 font-medium text-[13px]">
                        {seg}
                      </td>
                      <td className="text-right py-2 px-3.5 font-mono text-[13px] text-nurture">
                        {formatNumber(count)}
                      </td>
                      <td className="text-right py-2 px-3.5 font-mono text-[13px] text-muted">
                        {formatPercent(pct(count, bd.total))}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <Callout variant="nurture">
        <strong className="text-text">Nurture Opportunity:</strong>{" "}
        These are contacts who engaged (attended, visited booth, badge scan) but
        never booked a meeting. They are your warmest untapped pipeline. A
        post-event follow-up SLA with structured AE outreach and automated
        nurture sequences could recover 10-15% of these contacts into active
        pipeline.
      </Callout>
    </div>
  );
}
