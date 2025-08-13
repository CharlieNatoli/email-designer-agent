"use client";

import { useMemo } from "react";
// import mjml2html from 'mjml'
import { renderEmailDocumentMJML, type EmailDraft } from "@/lib/EmailComponents";

type Props = {
  status:  "input-streaming" | "call" | "result" | "input-available";
  result?: EmailDraft;
};

export default function DraftMarketingEmailTool({ status, result }: Props) {
  const html = useMemo(() => {
    if (!result || !result.sections || result.sections.length === 0) return "";
    const mjml = renderEmailDocumentMJML(result.sections);
    return mjml;
    // const { html } = mjml2html(mjml);
    // return html;
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
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <div style={{ fontSize: 13, opacity: 0.8 }}>Email draft ready</div>
      <button
        // onClick={() => {
        //   if (html) onOpenPreview(html);
        // }}
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
         <div>
              {html}
        </div>
    </div>
  );
}


