"use client";

import { memo } from "react";

type Props = {
  issuesText: string;
};

function IssuesTabInternal({ issuesText }: Props) {
  return (
    <textarea
      readOnly
      value={issuesText}
      style={{
        width: "100%",
        minHeight: 280,
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: 12,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 13,
        lineHeight: "18px",
        background: "#fff",
        color: "#111",
        whiteSpace: "pre-wrap",
      }}
    />
  );
}

const IssuesTab = memo(IssuesTabInternal);
export default IssuesTab;


