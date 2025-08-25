"use client";

import { ReactNode } from "react";

type MessageBubbleProps = {
  role: "user" | "assistant" | "system";
  children: ReactNode;
};

export default function MessageBubble({ role, children }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
      }}
    >
      <div
        className={`chat-bubble-base bubble ${isUser ? "bubble-user" : "bubble-assistant"}`}
      >
        {children}
      </div>
    </div>
  );
}


