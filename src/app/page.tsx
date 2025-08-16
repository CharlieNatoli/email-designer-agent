"use client";

import {useRef, useState } from "react";

import { useChat } from '@ai-sdk/react';
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from 'ai'; 


import ChatInput from "./components/ChatInput";
import MessageBubble from "./components/MessageBubble";
import DraftMarketingEmailToolDisplay from "@/tools/DraftMarketingEmailDisplay";
import CritiqueEmailToolDisplay from "@/tools/CritiqueEmailToolDisplay";
import ImageSidebar from "./components/ImageSidebar"; 

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
        gridTemplateColumns: "150px 1fr",
        gridTemplateRows: "1fr auto",
        backgroundColor: "#202123",
        color: "#ECECEC",
      }}
    >
      <div style={{ gridRow: "1 / span 2", gridColumn: 1, minWidth: 150 }}>
        <ImageSidebar />
      </div>

      <div
        ref={listRef}
        style={{
          overflowY: "auto",
          padding: "24px 0 100px",
          gridColumn: 2,
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 16px" }}>
          {messages.length === 0 && (
            <div style={{ opacity: 0.7, textAlign: "center", marginTop: 32 }}>
              Start a conversation below.
            </div>
          )}
  
          {messages.map((m: any) => { 
            // only log the last message
            if (m.id === messages[messages.length - 1].id) {
              console.log("MESSAGE", m);
            }

            return (
              <div key={m.id} style={{ marginBottom: 12 }}>
                {m.parts?.map((p: any) => {
                    if (p.type === "text") {
                      return <MessageBubble role={m.role} key={p.id}>{p.text}</MessageBubble>
                    }
                    if (p.type === "tool-DraftMarketingEmail") {
                      return <DraftMarketingEmailToolDisplay status={p.state} result={p.output} />
                    } 
                    if (p.type === "tool-CritiqueEmail") {
                      return <CritiqueEmailToolDisplay status={p.state} result={p.output} />
                    }
                  }) 
                }
              </div> 
            );

          })}

 
          {status === "streaming" && (
            <div style={{ opacity: 0.7, marginTop: 8 }}>Thinking…</div>
          )}
        </div>
      </div>

      <div style={{ gridColumn: 2 }}>
        <ChatInput
          value={input}
          setValue={setInput}
          sendMessage={(text) =>  sendMessage({ text })} 
          isLoading={status === "streaming" || status === "submitted"}
        />
      </div>
    </div>
  );
}

