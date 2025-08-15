"use client";

import { ReactNode } from "react";
import { createPortal } from "react-dom";

type PreviewDrawerProps = {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
};

export default function PreviewDrawer({ isOpen, title = "Preview", onClose, children }: PreviewDrawerProps) {
  if (!isOpen) return null;
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
        <div style={{ fontWeight: 600 }}>{title}</div>
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
        <div style={{ maxWidth: 640, margin: "0 auto" }}>{children}</div>
      </div>
    </div>,
    document.body
  );
}


