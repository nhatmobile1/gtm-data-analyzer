import type { DetectedColumns, CsvRow } from "@/lib/types";
import { detectColumns } from "@/lib/columnDetection";
import { COLUMN_SAMPLE_SIZE } from "@/lib/constants";
import Callout from "@/components/ui/Callout";

interface FieldMappingProps {
  columns: DetectedColumns;
  headers: string[];
  onColumnsChange: (columns: DetectedColumns) => void;
  rawData: CsvRow[];
}

export default function FieldMapping({ columns, headers, onColumnsChange, rawData }: FieldMappingProps) {
  const mappings = [
    { role: "Record ID", key: "id" as const, col: columns.id },
    { role: "Contact ID", key: "contactId" as const, col: columns.contactId },
    { role: "Channel", key: "channel" as const, col: columns.channel },
    { role: "Campaign Name", key: "campaign" as const, col: columns.campaign },
    { role: "Interaction Status", key: "interactionStatus" as const, col: columns.interactionStatus },
    { role: "Meeting Booked", key: "meetingBooked" as const, col: columns.meetingBooked },
    { role: "Opportunity ID", key: "oppId" as const, col: columns.oppId },
    { role: "Pipeline Revenue", key: "pipeline" as const, col: columns.pipeline },
    { role: "Closed Won Revenue", key: "closedWon" as const, col: columns.closedWon },
    { role: "Opportunity Stage", key: "oppStage" as const, col: columns.oppStage },
  ];

  return (
    <div style={{ animation: "fade-in 0.3s ease-out both" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold">
          Field Mapping
        </div>
        <button
          onClick={() => {
            const detected = detectColumns(headers, rawData.slice(0, COLUMN_SAMPLE_SIZE));
            onColumnsChange(detected);
          }}
          className="text-xs text-accent hover:text-text transition-colors"
        >
          Reset to auto-detected
        </button>
      </div>
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th scope="col" className="text-left py-2.5 px-3.5 text-[10px] uppercase tracking-wide text-muted border-b-2 border-border">
                Role
              </th>
              <th scope="col" className="text-left py-2.5 px-3.5 text-[10px] uppercase tracking-wide text-muted border-b-2 border-border">
                Mapped Column
              </th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((m) => (
              <tr key={m.role} className="transition-colors hover:bg-surface-hover">
                <td className="py-2.5 px-3.5 font-medium text-[13px]">
                  {m.role}
                </td>
                <td className="py-2.5 px-3.5">
                  <select
                    value={m.col || ""}
                    onChange={(e) => {
                      const val = e.target.value || null;
                      const updated = { ...columns, [m.key]: val };
                      onColumnsChange(updated);
                    }}
                    className="bg-surface border border-border text-text py-1 px-2 rounded text-xs font-mono w-full"
                  >
                    <option value="">Not mapped</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
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
        Use the dropdowns above to override any incorrect mapping.
      </Callout>
    </div>
  );
}
