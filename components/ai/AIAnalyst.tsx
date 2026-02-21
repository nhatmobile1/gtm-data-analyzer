"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Trash2 } from "lucide-react";
import type { Message } from "@/lib/types";

interface AIAnalystProps {
  messages: Message[];
  loading: boolean;
  streamingContent: string;
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

function renderInlineBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-text">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

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
  if (/^\d+\.\s/.test(line)) {
    return (
      <div key={index} className="pl-4 relative">
        <span className="absolute left-0 text-muted font-mono text-xs">
          {line.match(/^\d+/)?.[0]}.
        </span>
        {renderInlineBold(line.replace(/^\d+\.\s/, ""))}
      </div>
    );
  }
  if (line.startsWith("- ") || line.startsWith("\u2022 ")) {
    return (
      <div key={index} className="pl-4 relative">
        <span className="absolute left-1 text-muted">&bull;</span>
        {renderInlineBold(line.replace(/^[-\u2022]\s/, ""))}
      </div>
    );
  }
  if (line.trim() === "") {
    return <div key={index} className="h-2" />;
  }
  return <div key={index}>{renderInlineBold(line)}</div>;
}

function MessageContent({ content }: { content: string }) {
  return (
    <div className="text-[13px] leading-[1.7] whitespace-pre-wrap">
      {content.split("\n").map(renderMarkdownLine)}
    </div>
  );
}

export default function AIAnalyst({
  messages,
  loading,
  streamingContent,
  onAsk,
  onClear,
}: AIAnalystProps) {
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, streamingContent]);

  const handleSubmit = () => {
    if (!input.trim() || loading) return;
    onAsk(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-260px)]" style={{ animation: "fade-in 0.3s ease-out both" }}>
      {/* Starter prompts */}
      {messages.length === 0 && !loading && (
        <div className="mb-4" style={{ animation: "fade-in-up 0.4s ease-out both" }}>
          <div className="text-[15px] font-semibold mb-3">
            Ask anything about your data
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            {STARTER_PROMPTS.map((prompt, i) => (
              <button
                key={prompt}
                onClick={() => onAsk(prompt)}
                className="bg-surface border border-border rounded-lg py-2.5 px-3.5 text-muted text-xs text-left cursor-pointer leading-relaxed transition-all hover:border-accent/50 hover:text-text"
                style={{
                  animation: `fade-in-up 0.3s ease-out ${i * 0.04}s both`,
                }}
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
          <div
            key={i}
            className="flex gap-2.5 items-start"
            style={{ animation: "fade-in-up 0.25s ease-out both" }}
          >
            <div
              className={`w-7 h-7 rounded-md flex items-center justify-center text-[13px] shrink-0 mt-0.5 ${
                msg.role === "user"
                  ? "bg-accent-dark"
                  : "bg-surface border border-border"
              }`}
            >
              {msg.role === "user" ? "\ud83d\udc64" : "\ud83e\udd16"}
            </div>
            <div
              className={`flex-1 rounded-lg py-3 px-4 border ${
                msg.role === "user"
                  ? "bg-accent/[0.06] border-accent/20"
                  : "bg-surface border-border"
              }`}
            >
              {msg.role === "user" ? (
                <div className="text-[13px] leading-relaxed">{msg.content}</div>
              ) : (
                <MessageContent content={msg.content} />
              )}
            </div>
          </div>
        ))}

        {/* Streaming response */}
        {loading && (
          <div
            className="flex gap-2.5 items-start"
            style={{ animation: "fade-in 0.2s ease-out both" }}
          >
            <div className="w-7 h-7 rounded-md bg-surface border border-border flex items-center justify-center text-[13px] shrink-0">
              {"\ud83e\udd16"}
            </div>
            <div className="flex-1 bg-surface border border-border rounded-lg py-3 px-4">
              {streamingContent ? (
                <div className="relative">
                  <MessageContent content={streamingContent} />
                  <span
                    className="inline-block w-0.5 h-4 bg-accent ml-0.5 align-middle"
                    style={{ animation: "typewriter-blink 0.8s step-end infinite" }}
                  />
                </div>
              ) : (
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
              )}
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
          className="flex-1 bg-surface border border-border text-text py-2.5 px-3.5 rounded-lg text-[13px] font-sans outline-none focus:border-accent transition-colors"
          disabled={loading}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
          className={`py-2.5 px-4 rounded-lg text-[13px] font-semibold font-sans transition-colors flex items-center gap-1.5 ${
            loading || !input.trim()
              ? "bg-surface-alt text-muted cursor-not-allowed"
              : "bg-accent-dark text-white cursor-pointer hover:bg-accent"
          }`}
        >
          <Send size={14} />
          <span className="hidden sm:inline">{loading ? "..." : "Ask"}</span>
        </button>
        {messages.length > 0 && (
          <button
            onClick={onClear}
            className="bg-surface-alt border border-border text-muted py-2.5 px-3.5 rounded-lg cursor-pointer text-xs font-sans hover:text-text transition-colors flex items-center gap-1.5"
          >
            <Trash2 size={13} />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>
    </div>
  );
}
