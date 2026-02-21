"use client";

import { useState, useCallback, useRef } from "react";
import type { Message } from "@/lib/types";
import { MAX_AI_MESSAGES } from "@/lib/constants";

export function useAIChat(dataContext: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  // Use refs for values needed inside the async callback to avoid stale closures
  const messagesRef = useRef<Message[]>([]);
  const dataContextRef = useRef(dataContext);

  // Keep refs in sync
  messagesRef.current = messages;
  dataContextRef.current = dataContext;

  const ask = useCallback(
    async (question: string) => {
      if (!question.trim() || !dataContextRef.current) return;

      const userMsg: Message = { role: "user", content: question };
      setMessages((prev) => {
        const next = [...prev, userMsg];
        messagesRef.current = next;
        return next;
      });
      setLoading(true);
      setStreamingContent("");

      abortRef.current = new AbortController();

      let accumulated = "";

      try {
        // Read from ref for always-fresh messages
        const allMessages = [...messagesRef.current].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // Trim conversation history to limit token usage
            messages: allMessages.slice(-MAX_AI_MESSAGES),
            dataContext: dataContextRef.current,
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
          // User cancelled — save partial content if any
          if (accumulated) {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: accumulated + "\n\n*(response interrupted)*" },
            ]);
          }
        } else {
          // Save partial content on error instead of discarding it
          const errorSuffix = `\n\nError: ${err instanceof Error ? err.message : "Unknown error"}. Make sure the server is running and ANTHROPIC_API_KEY is set.`;
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: accumulated
                ? accumulated + errorSuffix
                : errorSuffix.trim(),
            },
          ]);
        }
      } finally {
        setLoading(false);
        setStreamingContent("");
        abortRef.current = null;
      }
    },
    // Only depend on stable values — messages and dataContext are read via refs
    []
  );

  const clear = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setMessages([]);
    messagesRef.current = [];
    setStreamingContent("");
    setLoading(false);
  }, []);

  return { messages, loading, streamingContent, ask, clear };
}
