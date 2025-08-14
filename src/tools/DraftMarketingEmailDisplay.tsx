"use client";

import { useEffect, useId, useMemo, useState } from "react"; 
import { createPortal } from "react-dom";

// MJML is compiled from a full MJML document string returned by the tool

// Module-scoped registry to ensure only one preview drawer is open at a time
let currentOpenId: string | null = null;
const subscribers = new Set<(id: string | null) => void>();

function getOpenId() {
  return currentOpenId;
}

function setOpenId(next: string | null) {
  currentOpenId = next;
  subscribers.forEach((fn) => fn(currentOpenId));
}

function subscribe(listener: (id: string | null) => void) {
  subscribers.add(listener);
  return () => subscribers.delete(listener);
}

type Props = {
  status:  "input-streaming" | "call" | "result" | "input-available";
  result?: { emailDraftMJML: string };
};

export default function DraftMarketingEmailTool({ status, result }: Props) {
  const instanceId = useId();
  const [isOpen, setIsOpen] = useState<boolean>(getOpenId() === instanceId);

  useEffect(() => {
    const unsubscribe = subscribe((openId) => setIsOpen(openId === instanceId));
    return () => {
      if (getOpenId() === instanceId) setOpenId(null);
      unsubscribe();
    };
  }, [instanceId]);

  const compiled = useMemo(() => {
    if (!result || !result.emailDraftMJML) return null;
    const mjml = result.emailDraftMJML;
    var mjml2html = require('mjml-browser');
    const { html } = mjml2html(mjml);
    console.log("[DraftMarketingEmailTool] mjml", mjml);
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }, [result]);

  console.log("[DraftMarketingEmailTool] status", status);
  console.log("[DraftMarketingEmailTool] result", result);
  

  if (status === "input-available") {
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: "#34D399",
            boxShadow: "0 0 12px #34D399, 0 0 24px rgba(52,211,153,0.6)",
            animation: "pulse 1.2s ease-in-out infinite",
          }}
        />
        <span style={{ opacity: 0.9 }}>Email draft in progress…</span>
        <style>{`@keyframes pulse{0%{opacity:0.6}50%{opacity:1}100%{opacity:0.6}}`}</style>
      </div>
    );
  }

  // completed
  return (
    <>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ fontSize: 13, opacity: 0.8 }}>Email draft ready</div>
        <button
          onClick={() => {
            if (compiled) setOpenId(instanceId);
          }}
          style={{
            background: "#10B981",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "6px 10px",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Open preview
        </button>
      </div>

      {isOpen && compiled
        ? createPortal(
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
                <div style={{ fontWeight: 600 }}>Preview</div>
                <button
                  onClick={() => setOpenId(null)}
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
                <div style={{ maxWidth: 640, margin: "0 auto" }}>{compiled}</div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}


