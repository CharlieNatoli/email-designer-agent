"use client";


import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

import ChatInput from "@/app/components/ChatInput";
import ImageSidebar from "@/app/components/ImageSidebar";
import ChatPageView from "@/app/components/ChatPageView"; 
import { renderMessage } from "@/app/components/renderMessage";


export default function Home() {
 
  
  const [input, setInput] = useState("");

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const sidebar = <ImageSidebar />;
  
  const messagesArea = (
    <>
      {messages.length === 0 && (
        <div style={{ opacity: 0.7, textAlign: "center", marginTop: 32 }}>
          Start a conversation below.
        </div>
      )}
      {messages.map((m: any) => renderMessage(m))}
      {status === "streaming" && (
        <div style={{ opacity: 0.7, marginTop: 8 }}>Thinking…</div>
      )}
    </>
  );
  const inputArea = (
    <ChatInput
      value={input}
      setValue={setInput}
      sendMessage={(text) => sendMessage({ text })}
      isLoading={status === "streaming" || status === "submitted"}
    />
  );

  return (
    <ChatPageView sidebar={sidebar} messagesArea={messagesArea} inputArea={inputArea} />
  );
}

