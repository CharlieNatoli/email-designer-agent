"use client";

import { useRef, useEffect, useState } from "react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

type ToolEvent =
  | { type: "text-delta" | "textDelta"; data?: string; delta?: string }
  | {
      type: "tool-result";
      data?: { toolName?: string; result?: { html?: string }; html?: string };
    };

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [renderedEmailHtml, setRenderedEmailHtml] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const MAX_ROWS = 3;
  const LINE_HEIGHT = 24; // px

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Auto-size the input up to 3 lines, then scroll
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const maxHeight = LINE_HEIGHT * MAX_ROWS;
    const next = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [input]);

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

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

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

      // let sseBuffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        // // If the stream is SSE (data: ... JSON\n\n), parse events; otherwise treat as plain text delta
        // if (chunk.includes("data:") || sseBuffer.length > 0) {
        //   sseBuffer += chunk;
        //   const parts = sseBuffer.split("\n\n");
        //   sseBuffer = parts.pop() ?? "";
        //   for (const block of parts) {
        //     const line = block.trim();
        //     if (!line.startsWith("data:")) continue;
        //     const payload = line.replace(/^data:\s*/, "");
        //     if (payload === "[DONE]") continue;
        //     try {
        //       const event: ToolEvent = JSON.parse(payload);
        //       if (event.type === "text-delta" || event.type === "textDelta") {
        //         const delta = (event as { type: string; data?: string; delta?: string }).data ??
        //           (event as { type: string; data?: string; delta?: string }).delta ?? "";
        //         assistantContent += delta;
        //         setMessages((prev) => {
        //           const updated = [...prev];
        //           updated[updated.length - 1] = { ...assistantMessage, content: assistantContent };
        //           return updated;
        //         });
        //       } else if (
        //         event.type === "tool-result" &&
        //         (event as { type: string; data?: { toolName?: string; result?: { html?: string }; html?: string } }).data?.toolName ===
        //           "DraftMarketingEmail"
        //       ) {
        //         const payload = (event as {
        //           type: string;
        //           data?: { toolName?: string; result?: { html?: string }; html?: string };
        //         }).data;
        //         const html = payload?.result?.html ?? payload?.html;
        //         if (typeof html === "string") setRenderedEmailHtml(html);
        //       }
        //     } catch {
        //       // ignore unparseable events
        //     }
        //   }
        // } else {
        //   // Plain text streaming
        //   assistantContent += chunk;
        //   setMessages((prev) => {
        //     const updated = [...prev];
        //     updated[updated.length - 1] = { ...assistantMessage, content: assistantContent };
        //     return updated;
        //   });
        // }
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
          <div
            style={{
              backgroundColor: "#343541",
              borderRadius: 12,
              padding: 8,
              border: "1px solid #3f4147",
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Send a message…"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  const form = e.currentTarget.form;
                  form?.requestSubmit();
                }
              }}
              style={{
                width: "100%",
                background: "transparent",
                color: "#ECECEC",
                border: "none",
                outline: "none",
                resize: "none",
                fontSize: 16,
                lineHeight: `${LINE_HEIGHT}px`,
                minHeight: `${LINE_HEIGHT}px`,
                maxHeight: `${LINE_HEIGHT * MAX_ROWS}px`,
              }}
            />
          </div>
          <div style={{ fontSize: 12, opacity: 0.6, marginTop: 8 }}>
            Tip: Ask me to “draft a marketing email about X”
          </div>
        </div>
      </form>
    </div>
  );
}
