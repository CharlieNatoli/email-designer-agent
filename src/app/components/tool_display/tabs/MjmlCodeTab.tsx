"use client";

import { memo, useState } from "react";

type Props = {
  mjml: string;
};

function MjmlCodeTabInternal({ mjml }: Props) {
  const [copied, setCopied] = useState<boolean>(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(mjml);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (_e) {
      // no-op
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <button
          onClick={handleCopy}
          style={{
            background: copied ? "#16a34a" : "#111827",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "6px 10px",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          {copied ? "Copied" : "Copy MJML code"}
        </button>
      </div>
      <textarea
        readOnly
        value={mjml}
        style={{
          width: "100%", 
          height: "100vh",
          resize: "vertical",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: 12,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 13,
          lineHeight: "18px",
          background: "#fff",
          color: "#111",
          whiteSpace: "pre",
        }}
      />
    </div>
  );
}

const MjmlCodeTab = memo(MjmlCodeTabInternal);
export default MjmlCodeTab;


