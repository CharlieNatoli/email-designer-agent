"use client";


import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { TOOL_RUN_STATUS } from "@/types/ai";

import ChatInput from "@/app/components/ChatInput";
import ImageSidebar from "@/app/components/ImageSidebar";
import ChatPageView from "@/app/components/ChatPageView"; 
import MessagesArea from "@/app/components/MessagesArea";


export default function Home() {
  
  const [input, setInput] = useState("");

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const sidebar = <ImageSidebar />;
  
  const messagesArea = (
    <MessagesArea messages={messages as any} status={status} />
  );
  const inputArea = (
    <ChatInput
      value={input}
      setValue={setInput}
      sendMessage={(text) => sendMessage({ text })}
      isLoading={status === TOOL_RUN_STATUS.streaming }
    />
  );

  return (
    <ChatPageView sidebar={sidebar} messagesArea={messagesArea} inputArea={inputArea} />
  );
}

