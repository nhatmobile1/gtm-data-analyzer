import type { DropOffResult, Totals } from "@/lib/types";
import { formatNumber, formatPercent, formatCurrency, pct } from "@/lib/formatting";
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
      <div className="py-10 text-center text-muted">
        <div className="text-[32px] mb-3">{"\ud83d\udd0d"}</div>
        <p>
          Drop-off analysis requires an <strong>Interaction Status</strong> field
          (with values like &quot;Attended&quot;, &quot;Visited Booth&quot;, etc.) and a{" "}
          <strong>Meeting Booked</strong> field. Check the Field Mapping tab to
          verify detection.
        </p>
      </div>
    );
  }

  const recoveryPipeline =
    totals && totals.meetings > 0
      ? Math.round(dropOff.noMeeting * 0.1) *
        (totals.pipeline / totals.meetings)
      : null;

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted mb-1">
            Engaged Contacts
          </div>
          <div className="text-[28px] font-bold font-mono">
            {formatNumber(dropOff.attended)}
          </div>
          <div className="text-[11px] text-muted">
            Attended / Visited / Badge Scan
          </div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-[10px] uppercase tracking-wider text-negative mb-1">
            Dropped Without Meeting
          </div>
          <div className="text-[28px] font-bold font-mono text-negative">
            {formatNumber(dropOff.noMeeting)}
          </div>
          <div className="text-[11px] text-muted">
            {formatPercent(pct(dropOff.noMeeting, dropOff.attended))} of engaged
            contacts
          </div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-[10px] uppercase tracking-wider text-positive mb-1">
            Estimated Pipeline if 10% Recovered
          </div>
          <div className="text-[28px] font-bold font-mono text-positive">
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
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
        {dropOff.breakdowns.map((bd) => (
          <div
            key={bd.label}
            className="bg-surface border border-border rounded-lg overflow-hidden"
          >
            <div className="py-[10px] px-[14px] border-b border-border text-xs font-semibold text-nurture">
              {bd.label}
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-2 px-[14px] text-[10px] uppercase text-muted border-b border-border">
                    Segment
                  </th>
                  <th className="text-right py-2 px-[14px] text-[10px] uppercase text-muted border-b border-border">
                    Count
                  </th>
                  <th className="text-right py-2 px-[14px] text-[10px] uppercase text-muted border-b border-border">
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(bd.data)
                  .sort((a, b) => b[1] - a[1])
                  .map(([seg, count]) => (
                    <tr key={seg}>
                      <td className="py-2 px-[14px] font-medium text-[13px]">
                        {seg}
                      </td>
                      <td className="text-right py-2 px-[14px] font-mono text-[13px] text-nurture">
                        {formatNumber(count)}
                      </td>
                      <td className="text-right py-2 px-[14px] font-mono text-[13px] text-muted">
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
        <strong className="text-text">
          {"\ud83c\udfaf"} Nurture Opportunity:
        </strong>{" "}
        These are contacts who engaged (attended, visited booth, badge scan) but
        never booked a meeting. They are your warmest untapped pipeline. A
        post-event follow-up SLA with structured AE outreach and automated
        nurture sequences could recover 10-15% of these contacts into active
        pipeline.
      </Callout>
    </div>
  );
}
