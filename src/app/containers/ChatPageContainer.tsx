"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

import ChatInput from "@/app/components/ChatInput";
import MessageBubble from "@/app/components/MessageBubble";
import ImageSidebar from "@/app/components/ImageSidebar";
import DraftMarketingEmailToolDisplay from "@/tools/DraftMarketingEmailDisplay";
import ChatPageView from "@/app/components/ChatPageView";
import type { MessagePart, UIMessage } from "@/types/ai";

function renderMessage(m: UIMessage | any) {
  return (
    <div key={m.id}>
      <br></br>
      <br></br>
      {m.parts?.map((part: MessagePart | any) => {
        if (part.type === "text") {
          return (
            <MessageBubble role={m.role} key={"text-" + part.id}>
              {part.text}
            </MessageBubble>
          );
        } else if (part.type === "data-tool-run") {
          if (part.data?.tool === "DraftMarketingEmail") {
            return (
              <DraftMarketingEmailToolDisplay
                key={part.id}
                text={part.data?.text}
                output={part.data?.final}
                status={part.data?.status}
              />
            );
          } else if (part.data?.tool === "EditEmail") {
            return (
              <DraftMarketingEmailToolDisplay
                key={part.id}
                text={part.data?.text}
                output={part.data?.final}
                status={part.data?.status}
              />
            );
          }
        }
      })}
    </div>
  );
}

export default function ChatPageContainer() {
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


