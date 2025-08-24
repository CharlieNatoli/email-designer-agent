"use client";

import { ReactNode, useMemo, useState } from "react";
import { createPortal } from "react-dom";

export type PreviewTab = {
  id: string;
  label: string;
  content: ReactNode;
};

type PreviewDrawerProps = {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  tabs: PreviewTab[];
  initialTabId?: string;
};

// todo - make prettier?
export default function PreviewDrawer({ isOpen, title = "Preview", onClose, tabs, initialTabId }: PreviewDrawerProps) {
  const firstTabId = useMemo(() => tabs[0]?.id, [tabs]);
  const [activeTabId, setActiveTabId] = useState<string>(initialTabId && tabs.some(t => t.id === initialTabId) ? initialTabId : firstTabId);

  if (!isOpen) return null;
  const active = tabs.find((t) => t.id === activeTabId) ?? tabs[0];

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "520px",
        background: "#fff",
        color: "#111",
        boxShadow: "-8px 0 24px rgba(0,0,0,0.4)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: 12, borderBottom: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      {tabs.map((t) => {
          const isActive = t.id === activeTabId;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTabId(t.id)}
              style={{
                background: isActive ? "#111" : "#e5e7eb",
                color: isActive ? "#fff" : "#111",
                border: "none",
                borderRadius: 6,
                padding: "6px 10px",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              {t.label}
            </button>
          );
        })}
        <button
          onClick={onClose}
          style={{
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: 6,
            padding: "6px 10px",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Close
        </button>
      </div> 
      <div style={{ overflow: "auto", padding: 16, background: "#f8f8f8" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>{active?.content}</div>
      </div>
    </div>,
    document.body
  );
}


