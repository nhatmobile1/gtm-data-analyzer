"use client";

import { Loader2 } from "lucide-react";
import FileUpload from "@/components/upload/FileUpload";
import Dashboard from "@/components/Dashboard";
import { useAnalysis } from "@/hooks/useAnalysis";

export default function Home() {
  const analysis = useAnalysis();

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

  if (!analysis.rawData) {
    return <FileUpload onFileSelect={analysis.loadCSV} />;
  }

  return <Dashboard analysis={analysis} />;
}
