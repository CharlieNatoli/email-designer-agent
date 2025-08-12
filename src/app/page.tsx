"use client";

import { useRef, useEffect, useState } from "react";
import DraftMarketingEmailTool from "../tools/DraftMarketingEmailDisplay";
import type { EmailDraft } from "@/lib/EmailComponents";
import ChatInput from "./components/ChatInput";

type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

type ToolEvent = { type?: string; data?: unknown; [k: string]: unknown };

type ToolState = {
  id: string;
  name: string;
  status: "pending" | "complete";
  result?: unknown;
};

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [renderedEmailHtml, setRenderedEmailHtml] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [tools, setTools] = useState<ToolState[]>([]);

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Input auto-size is handled inside ChatInput

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    console.log("nextMessages", nextMessages);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
   
      console.log("res", res);

      if (!res.ok || !res.body) {
        throw new Error("Request failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      // Optimistically add assistant message placeholder for streaming
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
      };
      setMessages((prev) => [...prev, assistantMessage]);

      let sseBuffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        // Parse SSE data events from toDataStreamResponse
        if (chunk.includes("data:") || sseBuffer.length > 0) {
          sseBuffer += chunk;
          const parts = sseBuffer.split("\n\n");
          sseBuffer = parts.pop() ?? "";
          for (const block of parts) {
            const lines = block.split("\n");
            const dataLine = lines.map((l) => l.trim()).find((l) => l.startsWith("data:"));
            if (!dataLine) continue;
            const payload = dataLine.replace(/^data:\s*/, "");
            if (payload === "[DONE]") continue;
            try {
              const event: ToolEvent = JSON.parse(payload);
              const type = String((event as any).type ?? "");

              // Handle text deltas across possible names
              if (/text[-_]?delta|response\.delta|message\.delta/i.test(type)) {
                const delta =
                  (event as any).delta ??
                  (event as any).textDelta ??
                  (event as any).data ??
                  (event as any).text ??
                  "";
                if (typeof delta === "string" && delta.length > 0) {
                  assistantContent += delta;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { ...assistantMessage, content: assistantContent };
                    return updated;
                  });
                }
                continue;
              }

              // Tool call start
              if (/tool[-_ ]call|tool[-_ ]start/i.test(type)) {
                const toolName = (event as any).toolName ?? (event as any).name ?? (event as any).data?.toolName;
                if (typeof toolName === "string") {
                  setTools((prev) => [
                    ...prev,
                    { id: crypto.randomUUID(), name: toolName, status: "pending" },
                  ]);
                }
                continue;
              }

              // Tool result
              if (/tool[-_ ]result|tool[-_ ]end/i.test(type) || (event as any).toolName) {
                const toolName = (event as any).toolName ?? (event as any).name ?? (event as any).data?.toolName;
                const resultPayload = (event as any).result ?? (event as any).data?.result ?? (event as any).data;
                if (typeof toolName === "string") {
                  setTools((prev) => {
                    const idx = prev.findIndex((t) => t.name === toolName && t.status === "pending");
                    const next = [...prev];
                    if (idx >= 0) {
                      next[idx] = { ...next[idx], status: "complete", result: resultPayload };
                    } else {
                      next.push({ id: crypto.randomUUID(), name: toolName, status: "complete", result: resultPayload });
                    }
                    return next;
                  });
                }
                continue;
              }
            } catch {
              // ignore
            }
          }
        } else {
          // Fallback: plain text chunks
          assistantContent += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...assistantMessage, content: assistantContent };
            return updated;
          });
        }
 
      }

      setIsLoading(false);
    } catch {
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: "Sorry, something went wrong." },
      ]);
    }
  }

  return (
    <div
      style={{
        height: "100dvh",
        display: "grid",
        gridTemplateColumns: showPreview ? "1fr 420px" : "1fr",
        gridTemplateRows: "1fr auto",
        backgroundColor: "#202123",
        color: "#ECECEC",
      }}
    >
      <div
        ref={listRef}
        style={{
          overflowY: "auto",
          padding: "24px 0 100px",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 16px" }}>
          {messages.length === 0 && (
            <div style={{ opacity: 0.7, textAlign: "center", marginTop: 32 }}>
              Start a conversation below.
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  backgroundColor: m.role === "user" ? "#343541" : "#444654",
                  color: "#ECECEC",
                  padding: "12px 14px",
                  borderRadius: 12,
                  maxWidth: "80%",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.5,
                }}
              >
                {m.content}
                {m.role === "assistant" && tools.map((t) => {
                  if (t.name === "DraftMarketingEmail") {
                    const result = t.result as EmailDraft | undefined;
                    return (
                      <div key={t.id} style={{ marginTop: 8 }}>
                        <DraftMarketingEmailTool
                          status={t.status}
                          result={result}
                          onOpenPreview={(html: string) => {
                            setRenderedEmailHtml(html);
                            setShowPreview(true);
                          }}
                        />
                      </div>
                    );
                  }
                  return null;
                })}
                {m.role === "assistant" && renderedEmailHtml && (
                  <div style={{ marginTop: 8 }}>
                    <button
                      onClick={() => setShowPreview((v) => !v)}
                      style={{
                        background: "#10B981",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        padding: "6px 10px",
                        cursor: "pointer",
                        fontSize: 14,
                      }}
                    >
                      {showPreview ? "Hide draft" : "Show draft"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{ opacity: 0.7, marginTop: 8 }}>Thinking…</div>
          )}
        </div>
      </div>

      {/* Popout preview panel */}
      {showPreview && (
        <div
          style={{
            borderLeft: "1px solid #3f4147",
            height: "100%",
            overflow: "hidden",
            background: "#111214",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, borderBottom: "1px solid #3f4147" }}>
            <div style={{ fontWeight: 600 }}>Email preview</div>
            <button
              onClick={() => setShowPreview(false)}
              style={{ background: "transparent", color: "#9CA3AF", border: "none", cursor: "pointer" }}
            >✕</button>
          </div>
          <iframe
            title="email-preview"
            style={{ width: "100%", height: "100%", border: "none", background: "white" }}
            srcDoc={renderedEmailHtml ?? ""}
          />
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim()) return;
          void sendMessage();
        }}
        style={{
          position: "sticky",
          bottom: 0,
          width: "100%",
          gridColumn: showPreview ? "1 / span 2" : "1 / span 1",
          background: "linear-gradient(180deg, rgba(32,33,35,0) 0%, #202123 40%)",
          padding: "16px 0 24px",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 16px" }}>
          <ChatInput value={input} setValue={setInput} />
          <div style={{ fontSize: 12, opacity: 0.6, marginTop: 8 }}>
            Tip: Ask me to “draft a marketing email about X”
          </div>
        </div>
      </form>
    </div>
  );
}
