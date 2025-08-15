"use client";

import { useId, useMemo, useState } from "react";
import EmailDraftInProgressNotice from "@/app/components/EmailDraftInProgressNotice";
import OpenPreviewButton from "@/app/components/OpenPreviewButton";
import PreviewDrawer from "@/app/components/PreviewDrawer";
import { useCompiledMjml, usePreviewDrawer } from "@/app/components/ToolDisplayBase";

type CritiqueResult = {
  issues: Array<{ issue: string; severity: string; fix: string }>;
  fixedMJML: string;
};

type Props = {
  status: "input-streaming" | "call" | "result" | "input-available";
  result?: CritiqueResult;
};

export default function CritiqueEmailToolDisplay({ status, result }: Props) {
  const instanceId = useId();
  const { isOpen, open, close } = usePreviewDrawer(instanceId);
  const compiledFixed = useCompiledMjml(result?.fixedMJML ?? null);
  const [activeTab, setActiveTab] = useState<"issues" | "fixed">("issues");

  const issuesText = useMemo(() => {
    if (!result?.issues?.length) return "No issues detected.";
    return result.issues
      .map((it, idx) => `${idx + 1}. [S${it.severity}] ${it.issue}\nFix: ${it.fix}`)
      .join("\n\n");
  }, [result]);

  if (status === "input-available") {
    return <EmailDraftInProgressNotice />;
  }

  const canOpen = Boolean(result && (result.issues || result.fixedMJML));

  return (
    <>
      <OpenPreviewButton onOpen={() => { if (canOpen) open(); }} disabled={!canOpen} label="Email critique ready" />
      <PreviewDrawer isOpen={Boolean(isOpen && canOpen)} onClose={close} title="Preview">
        <div style={{ display: "flex", gap: 8, paddingBottom: 8 }}>
          <button
            onClick={() => setActiveTab("issues")}
            style={{
              background: activeTab === "issues" ? "#111" : "#e5e7eb",
              color: activeTab === "issues" ? "#fff" : "#111",
              border: "none",
              borderRadius: 6,
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Issues
          </button>
          <button
            onClick={() => setActiveTab("fixed")}
            style={{
              background: activeTab === "fixed" ? "#111" : "#e5e7eb",
              color: activeTab === "fixed" ? "#fff" : "#111",
              border: "none",
              borderRadius: 6,
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Fixed email
          </button>
        </div>

        {activeTab === "issues" ? (
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
        ) : (
          <div>{compiledFixed}</div>
        )}
      </PreviewDrawer>
    </>
  );
}


