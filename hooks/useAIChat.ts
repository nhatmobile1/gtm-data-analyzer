"use client";

import { useState, useCallback, useRef } from "react";
import type { Message } from "@/lib/types";

export function useAIChat(dataContext: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const ask = useCallback(
    async (question: string) => {
      if (!question.trim() || !dataContext) return;

      const userMsg: Message = { role: "user", content: question };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);
      setStreamingContent("");

      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMsg].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            dataContext,
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const data = await res.json();
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `Error: ${data.error || "Failed to get response"}`,
            },
          ]);
          setLoading(false);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) {
          throw new Error("No response stream");
        }

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                break;
              }
              try {
                const parsed = JSON.parse(data);
                if (parsed.error) {
                  accumulated += `\nError: ${parsed.error}`;
                  setStreamingContent(accumulated);
                } else if (parsed.text) {
                  accumulated += parsed.text;
                  setStreamingContent(accumulated);
                }
              } catch {
                // Skip malformed JSON lines
              }
            }
          }
        }

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: accumulated },
        ]);
        setStreamingContent("");
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // User cancelled — keep partial content if any
          setStreamingContent("");
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `Error: ${err instanceof Error ? err.message : "Unknown error"}. Make sure the server is running and ANTHROPIC_API_KEY is set.`,
            },
          ]);
        }
      } finally {
        setLoading(false);
        setStreamingContent("");
        abortRef.current = null;
      }
    },
    [dataContext, messages]
  );

  const clear = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setMessages([]);
    setStreamingContent("");
    setLoading(false);
  }, []);

  return { messages, loading, streamingContent, ask, clear };
}
