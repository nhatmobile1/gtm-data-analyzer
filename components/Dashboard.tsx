"use client";

import { useState } from "react";
import { BarChart3, Upload } from "lucide-react";
import { formatNumber } from "@/lib/formatting";
import { useAIChat } from "@/hooks/useAIChat";
import type { useAnalysis } from "@/hooks/useAnalysis";
import EditableName from "@/components/ui/EditableName";
import TabBar from "@/components/ui/TabBar";
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
}

export default function Dashboard({
  analysis,
  dashboardName,
  onRenameDashboard,
  onReset,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState("ai");
  const aiChat = useAIChat(analysis.dataContext);

  return (
    <div className="min-h-screen text-[13px]" style={{ animation: "fade-in 0.3s ease-out both" }}>
      {/* Header */}
      <div className="py-3 sm:py-4 px-4 sm:px-6 border-b border-border flex items-center justify-between gap-3">
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
        <button
          onClick={onReset}
          className="bg-[#21262d] border border-border text-muted py-1.5 px-3 rounded-md cursor-pointer text-xs hover:text-text transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Upload size={13} />
          <span className="hidden sm:inline">Upload New File</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Mobile file info */}
      <div className="sm:hidden px-4 py-2 text-xs text-muted border-b border-border">
        {analysis.fileName} &middot; {formatNumber(analysis.rawData?.length ?? 0)} records
      </div>

      {/* KPI Row */}
      {analysis.totals && <KPIRow totals={analysis.totals} />}

      {/* Tab Bar */}
      <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="py-4 sm:py-5 px-4 sm:px-6">
        {activeTab === "ai" && (
          <AIAnalyst
            messages={aiChat.messages}
            loading={aiChat.loading}
            streamingContent={aiChat.streamingContent}
            onAsk={aiChat.ask}
            onClear={aiChat.clear}
          />
        )}

        {activeTab === "funnel" && analysis.selectedDim && (
          <FunnelTable
            funnel={analysis.funnel}
            selectedDim={analysis.selectedDim}
            allDimOptions={analysis.allDimOptions}
            onDimChange={analysis.setSelectedDim}
          />
        )}

        {activeTab === "charts" && analysis.totals && (
          <Charts
            funnel={analysis.funnel}
            totals={analysis.totals}
            selectedDim={analysis.selectedDim || "Channel"}
          />
        )}

        {activeTab === "crosscut" && (
          <CrossCutExplorer
            crossCut={analysis.crossCut}
            crossCutDim={analysis.crossCutDim}
            variance={analysis.variance}
            allDimOptions={analysis.allDimOptions}
            onDimChange={analysis.setCrossCutDim}
          />
        )}

        {activeTab === "dropoff" && (
          <DropOffAnalysis
            dropOff={analysis.dropOff}
            totals={analysis.totals}
          />
        )}

        {activeTab === "config" && analysis.columns && (
          <FieldMapping columns={analysis.columns} />
        )}
      </div>
    </div>
  );
}
