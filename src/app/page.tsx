"use client";

import { useRef, useEffect, useState } from "react";
import ChatInput from "./components/ChatInput";
import MessageBubble from "./components/MessageBubble";

type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

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

        // Parse SSE data events from the stream
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
              const event: any = JSON.parse(payload);
              const delta = event?.delta ?? event?.textDelta ?? event?.data ?? event?.text ?? "";
              if (typeof delta === "string" && delta.length > 0) {
                assistantContent += delta;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { ...assistantMessage, content: assistantContent };
                  return updated;
                });
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
        gridTemplateColumns: "1fr",
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
            <MessageBubble key={m.id} role={m.role}>
              {m.content}
            </MessageBubble>
          ))}
          {isLoading && (
            <div style={{ opacity: 0.7, marginTop: 8 }}>Thinking…</div>
          )}
        </div>
      </div>

      <ChatInput value={input} setValue={setInput} onSubmit={() => void sendMessage()} isLoading={isLoading} />
    </div>
  );
}
