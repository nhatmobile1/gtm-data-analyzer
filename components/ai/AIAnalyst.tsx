"use client";

import { useState, useRef, useEffect } from "react";
import type { Message } from "@/lib/types";

interface AIAnalystProps {
  messages: Message[];
  loading: boolean;
  onAsk: (question: string) => void;
  onClear: () => void;
}

const STARTER_PROMPTS = [
  "What are the 3 most important insights about marketing performance, channel efficiency, and pipeline contribution?",
  "Which channels are underperforming relative to their touch volume? Where should we reallocate budget?",
  "Design a reporting framework to monitor channel efficiency over time. What metrics, cadence, and stakeholders?",
  "What's the biggest operational or process change you'd recommend based on this data?",
  "Analyze the drop-off between event attendance and meetings booked. What's the nurture opportunity?",
  "Compare Account Tier performance. Are we targeting the right accounts?",
  "What's broken with the Direct Mail program? How would you fix it?",
  "If you were presenting this to a VP of Revenue Operations, what story would you tell?",
];

function renderMarkdownLine(line: string, index: number) {
  if (line.startsWith("## ") || line.startsWith("### ")) {
    return (
      <div
        key={index}
        className="font-bold text-sm mt-3 mb-1 text-accent first:mt-0"
      >
        {line.replace(/^#+\s/, "")}
      </div>
    );
  }
  if (line.startsWith("**") && line.endsWith("**")) {
    return (
      <div key={index} className="font-semibold mt-2 mb-0.5">
        {line.replace(/\*\*/g, "")}
      </div>
    );
  }
  if (line.startsWith("- ") || line.startsWith("\u2022 ")) {
    return (
      <div key={index} className="pl-4 relative">
        <span className="absolute left-1 text-muted">&bull;</span>
        {line.replace(/^[-\u2022]\s/, "")}
      </div>
    );
  }
  if (line.trim() === "") {
    return <div key={index} className="h-2" />;
  }
  return <div key={index}>{line}</div>;
}

export default function AIAnalyst({
  messages,
  loading,
  onAsk,
  onClear,
}: AIAnalystProps) {
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = () => {
    if (!input.trim() || loading) return;
    onAsk(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-260px)]">
      {/* Starter prompts */}
      {messages.length === 0 && (
        <div className="mb-4">
          <div className="text-[15px] font-semibold mb-3">
            Ask anything about your data
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => onAsk(prompt)}
                className="bg-surface border border-border rounded-lg py-[10px] px-[14px] text-muted text-xs text-left cursor-pointer leading-relaxed transition-all hover:border-accent hover:text-text"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto mb-3 flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div key={i} className="flex gap-[10px] items-start">
            <div
              className={`w-7 h-7 rounded-md flex items-center justify-center text-[13px] shrink-0 mt-0.5 ${
                msg.role === "user"
                  ? "bg-[#1f6feb]"
                  : "bg-surface border border-border"
              }`}
            >
              {msg.role === "user" ? "\ud83d\udc64" : "\ud83e\udd16"}
            </div>
            <div
              className={`flex-1 rounded-lg py-3 px-4 border ${
                msg.role === "user"
                  ? "bg-[rgba(31,111,235,0.08)] border-[rgba(31,111,235,0.2)]"
                  : "bg-surface border-border"
              }`}
            >
              {msg.role === "user" ? (
                <div className="text-[13px] leading-relaxed">{msg.content}</div>
              ) : (
                <div className="text-[13px] leading-[1.7] whitespace-pre-wrap">
                  {msg.content.split("\n").map(renderMarkdownLine)}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-[10px] items-start">
            <div className="w-7 h-7 rounded-md bg-surface border border-border flex items-center justify-center text-[13px] shrink-0">
              {"\ud83e\udd16"}
            </div>
            <div className="bg-surface border border-border rounded-lg py-3 px-4">
              <div className="flex gap-1 items-center">
                {[0, 1, 2].map((d) => (
                  <div
                    key={d}
                    className="w-1.5 h-1.5 rounded-full bg-accent"
                    style={{
                      animation: `pulse-dot 1.2s ${d * 0.2}s infinite`,
                    }}
                  />
                ))}
                <span className="ml-2 text-xs text-muted">
                  Analyzing your data...
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !loading) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Ask a question about your marketing data..."
          className="flex-1 bg-surface border border-border text-text py-[10px] px-[14px] rounded-lg text-[13px] font-sans outline-none focus:border-accent transition-colors"
          disabled={loading}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
          className={`py-[10px] px-5 rounded-lg text-[13px] font-semibold font-sans transition-colors ${
            loading || !input.trim()
              ? "bg-[#21262d] text-muted cursor-not-allowed"
              : "bg-[#1f6feb] text-white cursor-pointer hover:bg-accent"
          }`}
        >
          {loading ? "..." : "Ask"}
        </button>
        {messages.length > 0 && (
          <button
            onClick={onClear}
            className="bg-[#21262d] border border-border text-muted py-[10px] px-[14px] rounded-lg cursor-pointer text-xs font-sans hover:text-text transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
