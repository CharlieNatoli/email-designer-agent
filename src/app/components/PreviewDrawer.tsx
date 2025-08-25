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

export default function PreviewDrawer({ isOpen, onClose, tabs, initialTabId }: PreviewDrawerProps) {
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
        background: "var(--bg-light)",
        color: "var(--text-light)",
        boxShadow: "-8px 0 24px rgba(0,0,0,0.4)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: 12, borderBottom: "1px solid var(--border-light-1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ justifyContent: "flex-start", display: "flex", gap: 8 }}>
      {tabs.map((t) => {
          const isActive = t.id === activeTabId;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTabId(t.id)}
              className={`btn ${isActive ? 'btn--tab-active' : 'btn--tab'}`}
            >
              {t.label}
            </button>
          );
        })}
        </div>
        <button
          onClick={onClose}
          className="btn btn--danger"
        >
          Close
        </button>
      </div> 
      <div style={{ overflow: "auto", padding: 16, background: "var(--surface-light)" }}>
        <div className="container-sm">{active?.content}</div>
      </div>
    </div>,
    document.body
  );
}


