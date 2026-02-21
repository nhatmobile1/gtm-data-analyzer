"use client";

import { useCallback } from "react";
import { Download, Upload } from "lucide-react";
import type { DashboardEntry, DashboardFolder } from "@/lib/types";

interface ExportImportProps {
  dashboards: DashboardEntry[];
  folders: DashboardFolder[];
  onImport: (data: { dashboards: DashboardEntry[]; folders: DashboardFolder[] }) => void;
}

export default function ExportImport({
  dashboards,
  folders,
  onImport,
}: ExportImportProps) {
  const handleExport = useCallback(() => {
    const data = JSON.stringify({ dashboards, folders }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gtm-analyzer-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [dashboards, folders]);

  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        if (data.dashboards && Array.isArray(data.dashboards)) {
          onImport(data);
        }
      } catch {
        // Invalid JSON — silently ignore
      }
    };
    input.click();
  }, [onImport]);

  if (dashboards.length === 0) return null;

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExport}
        className="flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors py-1 px-2 rounded border border-border"
      >
        <Download size={12} />
        Export
      </button>
      <button
        onClick={handleImport}
        className="flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors py-1 px-2 rounded border border-border"
      >
        <Upload size={12} />
        Import
      </button>
    </div>
  );
}
