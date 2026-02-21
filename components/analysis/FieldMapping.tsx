import type { DetectedColumns } from "@/lib/types";
import Callout from "@/components/ui/Callout";

interface FieldMappingProps {
  columns: DetectedColumns;
}

export default function FieldMapping({ columns }: FieldMappingProps) {
  const mappings = [
    { role: "Record ID", col: columns.id },
    { role: "Contact ID", col: columns.contactId },
    { role: "Channel", col: columns.channel },
    { role: "Campaign Name", col: columns.campaign },
    { role: "Interaction Status", col: columns.interactionStatus },
    { role: "Meeting Booked", col: columns.meetingBooked },
    { role: "Opportunity ID", col: columns.oppId },
    { role: "Pipeline Revenue", col: columns.pipeline },
    { role: "Closed Won Revenue", col: columns.closedWon },
    { role: "Opportunity Stage", col: columns.oppStage },
  ];

  return (
    <div style={{ animation: "fade-in 0.3s ease-out both" }}>
      <div className="text-sm font-semibold mb-4">
        Auto-Detected Field Mapping
      </div>
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left py-2.5 px-3.5 text-[10px] uppercase tracking-wide text-muted border-b-2 border-border">
                Role
              </th>
              <th className="text-left py-2.5 px-3.5 text-[10px] uppercase tracking-wide text-muted border-b-2 border-border">
                Detected Column
              </th>
              <th className="text-left py-2.5 px-3.5 text-[10px] uppercase tracking-wide text-muted border-b-2 border-border">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((m) => (
              <tr key={m.role} className="transition-colors hover:bg-surface-hover">
                <td className="py-2.5 px-3.5 font-medium text-[13px]">
                  {m.role}
                </td>
                <td
                  className={`py-2.5 px-3.5 font-mono text-xs ${m.col ? "text-text" : "text-muted"}`}
                >
                  {m.col || "Not detected"}
                </td>
                <td className="py-2.5 px-3.5">
                  <span
                    className={`text-[11px] py-0.5 px-2 rounded ${
                      m.col
                        ? "bg-positive/15 text-positive"
                        : "bg-negative/15 text-negative"
                    }`}
                  >
                    {m.col ? "\u2713 Mapped" : "\u2715 Missing"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-sm font-semibold mt-6 mb-3">
        Detected Dimensions ({columns.dimensions.length})
      </div>
      <div className="flex flex-wrap gap-2">
        {columns.dimensions.map((d) => (
          <span
            key={d}
            className="py-1 px-3 bg-surface border border-border rounded-md text-xs"
          >
            {d}
          </span>
        ))}
      </div>

      <Callout variant="info">
        <strong className="text-text">How detection works:</strong> Columns are
        matched by name patterns (e.g., &quot;channel&quot;, &quot;pipeline&quot;, &quot;meeting
        booked&quot;). Dimensions are any categorical column with 2-40 unique values.
        If a mapping is wrong, the analysis may produce unexpected results —
        check this tab first.
      </Callout>
    </div>
  );
}
