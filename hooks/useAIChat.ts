"use client";

import { useState, useCallback } from "react";
import type { Message } from "@/lib/types";

export function useAIChat(dataContext: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const ask = useCallback(
    async (question: string) => {
      if (!question.trim() || !dataContext) return;

      const userMsg: Message = { role: "user", content: question };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

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
        });

        const data = await res.json();

        if (!res.ok) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `Error: ${data.error || "Failed to get response"}`,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.content },
          ]);
        }
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Error: ${err instanceof Error ? err.message : "Unknown error"}. Make sure the server is running and ANTHROPIC_API_KEY is set.`,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [dataContext, messages]
  );

  const clear = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, loading, ask, clear };
}
