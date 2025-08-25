"use client";

import { useEffect, useRef } from "react";

type ChatInputProps = {
  value: string;
  setValue: (next: string) => void;
  placeholder?: string;
  sendMessage: (message: string) => void;
  isLoading?: boolean;
};

export default function ChatInput({ value, setValue, placeholder = "Describe your email idea…", sendMessage, isLoading = false }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const MAX_ROWS = 5;
  const LINE_HEIGHT = 24; // px

  // Auto-size the input up to 5 lines, then scroll
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
    <form
      onSubmit={e => {
        e.preventDefault();
        if (!value.trim()) return;
        sendMessage(value);
        setValue('');
      }}
      style={{
        position: "sticky",
        bottom: 0,
        width: "100%",
        gridColumn: "1 / span 1",
        background: "linear-gradient(180deg, rgba(32,33,35,0) 0%, var(--bg) 40%)",
        padding: "16px 0 24px",
      }}
    >
      <div className="container">
        <div
          className="card-dark"
          style={{ padding: 8 }}
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
            disabled={isLoading}
            className="textarea-reset chat-text-base"
            style={{
              width: "100%",
              fontSize: 16,
              lineHeight: `${LINE_HEIGHT}px`,
              minHeight: `${LINE_HEIGHT}px`,
              maxHeight: `${LINE_HEIGHT * MAX_ROWS}px`,
              opacity: isLoading ? 0.7 : 1,
            }}
          />
        </div>
      </div>
    </form>
  );
}


