"use client";

import { useEffect, useRef } from "react";

type ChatInputProps = {
  value: string;
  setValue: (next: string) => void;
  placeholder?: string;
};

export default function ChatInput({ value, setValue, placeholder = "Send a message…" }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const MAX_ROWS = 3;
  const LINE_HEIGHT = 24; // px

  // Auto-size the input up to 3 lines, then scroll
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const maxHeight = LINE_HEIGHT * MAX_ROWS;
    const next = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [value]);

  return (
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
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
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
  );
}


