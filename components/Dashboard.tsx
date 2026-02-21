"use client";

import { useState } from "react";
import { formatNumber } from "@/lib/formatting";
import { useAIChat } from "@/hooks/useAIChat";
import type { useAnalysis } from "@/hooks/useAnalysis";
import TabBar from "@/components/ui/TabBar";
import KPIRow from "@/components/analysis/KPIRow";
import FunnelTable from "@/components/analysis/FunnelTable";
import Charts from "@/components/analysis/Charts";
import CrossCutExplorer from "@/components/analysis/CrossCutExplorer";
import DropOffAnalysis from "@/components/analysis/DropOffAnalysis";
import FieldMapping from "@/components/analysis/FieldMapping";
import AIAnalyst from "@/components/ai/AIAnalyst";

const TABS = [
  { id: "ai", label: "\ud83e\udd16 AI Analyst" },
  { id: "funnel", label: "Funnel Analysis" },
  { id: "charts", label: "Visual Charts" },
  { id: "crosscut", label: "Cross-Cut Explorer" },
  { id: "dropoff", label: "Drop-Off & Nurture" },
  { id: "config", label: "Field Mapping" },
];

interface DashboardProps {
  analysis: ReturnType<typeof useAnalysis>;
}

export default function Dashboard({ analysis }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("ai");
  const aiChat = useAIChat(analysis.dataContext);

  return (
    <div className="min-h-screen text-[13px]">
      {/* Header */}
      <div className="py-4 px-6 border-b border-border flex items-center justify-between">
        <div>
          <span className="font-bold text-base">
            {"\ud83d\udcca"} Marketing Data Analyzer
          </span>
          <span className="text-muted ml-3 text-xs">
            {analysis.fileName} &middot;{" "}
            {formatNumber(analysis.rawData?.length ?? 0)} records
          </span>
        </div>
        <button
          onClick={analysis.reset}
          className="bg-[#21262d] border border-border text-muted py-1.5 px-[14px] rounded-md cursor-pointer text-xs hover:text-text transition-colors"
        >
          Upload New File
        </button>
      </div>

      {/* KPI Row */}
      {analysis.totals && <KPIRow totals={analysis.totals} />}

      {/* Tab Bar */}
      <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="py-5 px-6">
        {activeTab === "ai" && (
          <AIAnalyst
            messages={aiChat.messages}
            loading={aiChat.loading}
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
