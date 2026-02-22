"use client";

import { useState } from "react";
import { BarChart3, Upload, FolderOpen } from "lucide-react";
import { formatNumber } from "@/lib/formatting";
import { useAIChat } from "@/hooks/useAIChat";
import type { useAnalysis } from "@/hooks/useAnalysis";
import type { DashboardEntry, DashboardFolder } from "@/lib/types";
import EditableName from "@/components/ui/EditableName";
import TabBar from "@/components/ui/TabBar";
import SidebarDrawer from "@/components/ui/SidebarDrawer";
import DashboardBrowser from "@/components/upload/DashboardBrowser";
import KPIRow from "@/components/analysis/KPIRow";
import FunnelTable from "@/components/analysis/FunnelTable";
import Charts from "@/components/analysis/Charts";
import CrossCutExplorer from "@/components/analysis/CrossCutExplorer";
import DropOffAnalysis from "@/components/analysis/DropOffAnalysis";
import FieldMapping from "@/components/analysis/FieldMapping";
import AIAnalyst from "@/components/ai/AIAnalyst";

const TABS = [
  { id: "ai", label: "AI Analyst" },
  { id: "funnel", label: "Funnel Analysis" },
  { id: "charts", label: "Visual Charts" },
  { id: "crosscut", label: "Cross-Cut Explorer" },
  { id: "dropoff", label: "Drop-Off & Nurture" },
  { id: "config", label: "Field Mapping" },
];

interface DashboardProps {
  analysis: ReturnType<typeof useAnalysis>;
  dashboardName: string;
  onRenameDashboard: (newName: string) => void;
  onReset: () => void;
  dashboards: DashboardEntry[];
  folders: DashboardFolder[];
  onDashboardSelect: (id: string) => void;
  onDashboardRemove: (id: string) => void;
  onDashboardRename: (id: string, newName: string) => void;
  onDashboardMove: (id: string, folderId: string | null) => void;
  onFolderCreate: (name: string) => void;
  onFolderRename: (id: string, newName: string) => void;
  onFolderRemove: (id: string) => void;
  onClearAll: () => void;
  onImport: (data: { dashboards: DashboardEntry[]; folders: DashboardFolder[] }) => void;
}

export default function Dashboard({
  analysis,
  dashboardName,
  onRenameDashboard,
  onReset,
  dashboards,
  folders,
  onDashboardSelect,
  onDashboardRemove,
  onDashboardRename,
  onDashboardMove,
  onFolderCreate,
  onFolderRename,
  onFolderRemove,
  onClearAll,
  onImport,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState("ai");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const aiChat = useAIChat(analysis.dataContext);

  const handleDrawerSelect = (id: string) => {
    onDashboardSelect(id);
    setDrawerOpen(false);
  };

  return (
    <div className="min-h-screen text-[13px]" style={{ animation: "fade-in 0.3s ease-out both" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-base py-3 sm:py-4 px-4 sm:px-6 border-b border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <BarChart3 size={18} className="text-accent shrink-0" />
          <EditableName
            value={dashboardName}
            onSave={onRenameDashboard}
            className="font-bold text-sm sm:text-base"
          />
          <span className="text-muted text-xs hidden sm:inline shrink-0">
            | {analysis.fileName} &middot;{" "}
            {formatNumber(analysis.rawData?.length ?? 0)} records
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDrawerOpen(true)}
            className="bg-surface-alt border border-border text-muted py-1.5 px-3 rounded-md cursor-pointer text-xs hover:text-text transition-colors flex items-center gap-1.5 shrink-0"
            title="Manage dashboards"
          >
            <FolderOpen size={13} />
            <span className="hidden sm:inline">Dashboards</span>
          </button>
          <button
            onClick={onReset}
            className="bg-surface-alt border border-border text-muted py-1.5 px-3 rounded-md cursor-pointer text-xs hover:text-text transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Upload size={13} />
            <span className="hidden sm:inline">Upload New File</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Mobile file info */}
      <div className="sm:hidden sticky top-[49px] z-30 bg-base px-4 py-2 text-xs text-muted border-b border-border">
        {analysis.fileName} &middot; {formatNumber(analysis.rawData?.length ?? 0)} records
      </div>

      {/* KPI Row */}
      {analysis.totals && <KPIRow totals={analysis.totals} />}

      {/* Tab Bar */}
      <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="py-4 sm:py-5 px-4 sm:px-6">
        <div className={activeTab === "ai" ? "" : "hidden"}>
          <AIAnalyst
            messages={aiChat.messages}
            loading={aiChat.loading}
            streamingContent={aiChat.streamingContent}
            onAsk={aiChat.ask}
            onClear={aiChat.clear}
            columns={analysis.columns}
          />
        </div>

        <div className={activeTab === "funnel" ? "" : "hidden"}>
          {analysis.selectedDim && (
            <FunnelTable
              funnel={analysis.funnel}
              selectedDim={analysis.selectedDim}
              allDimOptions={analysis.allDimOptions}
              onDimChange={analysis.setSelectedDim}
            />
          )}
        </div>

        <div className={activeTab === "charts" ? "" : "hidden"}>
          {analysis.totals && (
            <Charts
              funnel={analysis.funnel}
              totals={analysis.totals}
              selectedDim={analysis.selectedDim || "Channel"}
            />
          )}
        </div>

        <div className={activeTab === "crosscut" ? "" : "hidden"}>
          <CrossCutExplorer
            crossCut={analysis.crossCut}
            crossCutDim={analysis.crossCutDim}
            variance={analysis.variance}
            allDimOptions={analysis.allDimOptions}
            onDimChange={analysis.setCrossCutDim}
          />
        </div>

        <div className={activeTab === "dropoff" ? "" : "hidden"}>
          <DropOffAnalysis
            dropOff={analysis.dropOff}
            totals={analysis.totals}
          />
        </div>

        <div className={activeTab === "config" ? "" : "hidden"}>
          {analysis.columns && (
            <FieldMapping
              columns={analysis.columns}
              headers={analysis.headers}
              onColumnsChange={analysis.updateColumns}
              rawData={analysis.rawData || []}
            />
          )}
        </div>
      </div>

      {/* Dashboard management drawer */}
      <SidebarDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Manage Dashboards"
      >
        <DashboardBrowser
          dashboards={dashboards}
          folders={folders}
          onDashboardSelect={handleDrawerSelect}
          onDashboardRemove={onDashboardRemove}
          onDashboardRename={onDashboardRename}
          onDashboardMove={onDashboardMove}
          onFolderCreate={onFolderCreate}
          onFolderRename={onFolderRename}
          onFolderRemove={onFolderRemove}
          onClearAll={onClearAll}
          onImport={onImport}
        />
      </SidebarDrawer>
    </div>
  );
}
