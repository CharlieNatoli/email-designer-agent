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
          className={`btn ${copied ? 'btn--success' : 'btn--primary-dark'}`}
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
          border: "1px solid var(--border-light-1)",
          borderRadius: 8,
          padding: 12,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 13,
          lineHeight: "18px",
          background: "var(--bg-light)",
          color: "var(--text-light)",
          whiteSpace: "pre",
        }}
      />
    </div>
  );
}

const MjmlCodeTab = memo(MjmlCodeTabInternal);
export default MjmlCodeTab;


