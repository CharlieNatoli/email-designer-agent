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
        style={{
          backgroundColor: isUser ? "#343541" : "#444654",
          color: "#ECECEC",
          padding: "12px 14px",
          borderRadius: 12,
          maxWidth: "80%",
          whiteSpace: "pre-wrap",
          lineHeight: 1.5,
        }}
      >
        {children}
      </div>
    </div>
  );
}


