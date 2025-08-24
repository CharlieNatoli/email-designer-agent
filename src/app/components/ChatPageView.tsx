"use client";

import { ReactNode, useRef } from "react";

type Props = {
  sidebar: ReactNode;
  messagesArea: ReactNode;
  inputArea: ReactNode;
};

export default function ChatPageView({ sidebar, messagesArea, inputArea }: Props) {
  const listRef = useRef<HTMLDivElement | null>(null);

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
        {sidebar}
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
          {messagesArea}
        </div>
      </div>

      <div style={{ gridColumn: 2 }}>
        {inputArea}
      </div>
    </div>
  );
}


