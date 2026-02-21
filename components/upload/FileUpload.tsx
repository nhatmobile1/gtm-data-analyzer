"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, BarChart3, Brain, GitFork, Target } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

const FEATURES = [
  {
    icon: BarChart3,
    title: "Full-Funnel Analysis",
    desc: "Pipeline, meetings, and efficiency by any dimension",
  },
  {
    icon: GitFork,
    title: "Cross-Cut Explorer",
    desc: "Slice data by dimension with variance signals",
  },
  {
    icon: Target,
    title: "Drop-Off Detection",
    desc: "Find engaged contacts who didn't convert",
  },
  {
    icon: Brain,
    title: "AI Analyst",
    desc: "Ask questions, get answers backed by your data",
  },
];

export default function FileUpload({ onFileSelect }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith(".csv")) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDragEnter = useCallback(() => setIsDragging(true), []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6">
      {/* Header */}
      <div
        className="text-center mb-8 sm:mb-10"
        style={{ animation: "fade-in-up 0.5s ease-out both" }}
      >
        <div className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          Marketing Data Analyzer
        </div>
        <div className="text-muted text-sm max-w-md mx-auto">
          Upload campaign CSV data for full-funnel analysis, interactive
          visualizations, and AI-powered insights
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`w-full max-w-lg border-2 border-dashed rounded-lg py-10 sm:py-14 px-6 sm:px-12 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-accent bg-accent/[0.04] scale-[1.01]"
            : "border-border hover:border-muted hover:bg-surface/50"
        }`}
        style={{ animation: "fade-in-up 0.5s ease-out 0.1s both" }}
      >
        <div
          className={`mx-auto mb-4 w-14 h-14 rounded-lg flex items-center justify-center transition-colors ${
            isDragging ? "bg-accent/10 text-accent" : "bg-surface text-muted"
          }`}
        >
          <Upload size={28} />
        </div>
        <div className="text-base font-semibold mb-1.5">
          Drop a CSV file here
        </div>
        <div className="text-muted text-sm mb-4">or click to browse</div>
        <div className="text-muted text-xs">
          Auto-detects channels, pipeline, meetings, dimensions, and more
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleInputChange}
        />
      </div>

      {/* Feature Cards */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 sm:mt-10 w-full max-w-2xl"
        style={{ animation: "fade-in-up 0.5s ease-out 0.25s both" }}
      >
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="bg-surface/50 border border-border/50 rounded-lg p-3 sm:p-4 text-center"
          >
            <f.icon
              size={20}
              className="mx-auto mb-2 text-muted"
            />
            <div className="text-xs font-semibold mb-0.5">{f.title}</div>
            <div className="text-[11px] text-muted leading-snug">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
