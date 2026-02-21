"use client";

import FileUpload from "@/components/upload/FileUpload";
import Dashboard from "@/components/Dashboard";
import { useAnalysis } from "@/hooks/useAnalysis";

export default function Home() {
  const analysis = useAnalysis();

  if (!analysis.rawData) {
    return <FileUpload onFileSelect={analysis.loadCSV} />;
  }

  return <Dashboard analysis={analysis} />;
}
