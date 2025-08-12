"use client";

import { useEffect, useRef, useState } from "react";

import { useChat } from '@ai-sdk/react';
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from 'ai'; 


import ChatInput from "./components/ChatInput";
import MessageBubble from "./components/MessageBubble";
import DraftMarketingEmailTool from "@/tools/DraftMarketingEmailDisplay";


function ToolPartRenderer({
  part,
}: {
  part: {
    type: string;
    state?: "input-streaming" | "call" | "result" | "error";
    toolName?: string;
    toolCallId?: string;
    input?: any;
    output?: any;
    errorText?: string;
  };
}) {
  const isPending =
    part.state === "input-streaming" || part.state === "call" || !part.state;

  // Example custom rendering for a known tool
  if (part.type === "tool-DraftMarketingEmail") {
    if (isPending) return <ToolShell status="pending" />;
    if (part.state === "error")
      return <ToolShell status="error" detail={part.errorText ?? "Tool failed."} />;
    // Success
    return <DraftMarketingEmailTool status={part.state} result={part.output} />;
  }

}

function ToolShell({
  status,
  detail,
}: {
  status: "pending" | "error";
  detail?: string;
}) {
  if (status === "pending") {
    return (
      <div style={{ border: "1px dashed #555", borderRadius: 8, padding: 12, marginTop: 8 }}>
        <span style={{ opacity: 0.8 }}>Tool loading…</span>
      </div>
    );
  }
  return (
    <div style={{ border: "1px solid #903", borderRadius: 8, padding: 12, marginTop: 8 }}>
      <strong style={{ color: "#f66" }}>Tool error:</strong>{" "}
      <span style={{ opacity: 0.9 }}>{detail}</span>
    </div>
  );
}


type BubbleProps = {
  id: string;
  role: "user" | "assistant" | "system";
  parts?: Array<
    | { type: "text"; text: string }
    | {
        type: string; // 'tool-<Name>' or 'dynamic-tool'
        state?: "input-streaming" | "call" | "result" | "error";
        toolName?: string;
        toolCallId?: string;
        input?: any;
        output?: any;
        errorText?: string;
      }
  >;
  content?: string; // for legacy/convenience; we render parts if present
};

export default function Home() {
  const listRef = useRef<HTMLDivElement | null>(null);  

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,

  });
  const [input, setInput] = useState('');
 
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
  
          {messages.map((m: any) => {

            console.log("MESSAGE", m);

            return (
              <div key={m.id} style={{ marginBottom: 12 }}>
                <MessageBubble role={m.role}> 
                  {m.parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('\n')}
                </MessageBubble>
              </div>
            );
          })}

          {status === "streaming" && (
            <div style={{ opacity: 0.7, marginTop: 8 }}>Thinking…</div>
          )}
        </div>
      </div>

      <ChatInput
        value={input}
        setValue={setInput}
        sendMessage={(text) =>  sendMessage({ text })} 
        isLoading={status === "streaming" || status === "submitted"}
      />
    </div>
  );
}