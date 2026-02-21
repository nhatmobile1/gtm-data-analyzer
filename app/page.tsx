"use client";

import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import Papa from "papaparse";
import FileUpload from "@/components/upload/FileUpload";
import Dashboard from "@/components/Dashboard";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useDashboardStore } from "@/hooks/useDashboardStore";

export default function Home() {
  const analysis = useAnalysis();
  const store = useDashboardStore();
  const [activeDashboardId, setActiveDashboardId] = useState<string | null>(null);

  const activeDashboard = activeDashboardId
    ? store.getDashboard(activeDashboardId)
    : undefined;

  const handleFileSelect = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        // Use PapaParse for accurate row count (handles CRLF, quoted newlines)
        const preview = Papa.parse(text, { preview: 0 });
        const rowCount = Math.max(0, (preview.data as unknown[]).length - 1);
        const entry = store.saveDashboard(file.name, text, rowCount);
        setActiveDashboardId(entry.id);
        analysis.loadCSVText(file.name, text);
      };
      reader.onerror = () => {
        analysis.setError("Failed to read the file. Please try again.");
      };
      reader.readAsText(file);
    },
    // Depend on stable individual functions, not the entire hook objects
    [store.saveDashboard, analysis.loadCSVText]
  );

  const handleDashboardSelect = useCallback(
    (id: string) => {
      const entry = store.getDashboard(id);
      if (entry) {
        setActiveDashboardId(id);
        analysis.loadCSVText(entry.fileName, entry.csvText);
      }
    },
    [store.getDashboard, analysis.loadCSVText]
  );

  const handleRenameDashboard = useCallback(
    (newName: string) => {
      if (activeDashboardId) {
        store.renameDashboard(activeDashboardId, newName);
      }
    },
    [activeDashboardId, store.renameDashboard]
  );

  const handleReset = useCallback(() => {
    setActiveDashboardId(null);
    analysis.reset();
  }, [analysis.reset]);

  if (analysis.parsing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <Loader2
          size={28}
          className="text-accent animate-spin"
        />
        <div className="text-sm text-muted">
          Parsing {analysis.fileName}...
        </div>
      </div>
    );
  }

  if (analysis.error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4">
        <div className="text-negative text-sm font-semibold">Error</div>
        <div className="text-muted text-sm text-center max-w-md">{analysis.error}</div>
        <button
          onClick={() => { analysis.setError(null); analysis.reset(); }}
          className="mt-2 py-1.5 px-4 rounded-md text-xs bg-surface border border-border text-muted hover:text-text transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!analysis.rawData) {
    return (
      <FileUpload
        onFileSelect={handleFileSelect}
        dashboards={store.dashboards}
        folders={store.folders}
        onDashboardSelect={handleDashboardSelect}
        onDashboardRemove={store.removeDashboard}
        onDashboardRename={store.renameDashboard}
        onDashboardMove={store.moveDashboard}
        onFolderCreate={store.createFolder}
        onFolderRename={store.renameFolder}
        onFolderRemove={store.removeFolder}
        onClearAll={store.clearAll}
      />
    );
  }

  const dashboardName = activeDashboard?.name || analysis.fileName.replace(/\.csv$/i, "");

  return (
    <Dashboard
      analysis={analysis}
      dashboardName={dashboardName}
      onRenameDashboard={handleRenameDashboard}
      onReset={handleReset}
    />
  );
}
