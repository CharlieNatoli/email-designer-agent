"use client";

import { TOOL_NAME } from "@/types/ai";

type OpenPreviewButtonProps = {
  onOpen: () => void;
  disabled?: boolean;
  label?: string;
  draftCompleted?: boolean;
  toolName: typeof TOOL_NAME.DraftMarketingEmail | typeof TOOL_NAME.EditMarketingEmail;
};

export default function OpenPreviewButton({ onOpen, disabled = false, draftCompleted = false, toolName}: OpenPreviewButtonProps) {


  const EmailInProgressText = toolName === TOOL_NAME.DraftMarketingEmail ? "Drafting email..." : "Editing email...";
  const EmailCompletedText = toolName === TOOL_NAME.EditMarketingEmail ? "View edited email draft." : "View email draft";
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <button
        className="chat-bubble-base"
        onClick={onOpen}
        disabled={disabled}
        style={{
          background: "#10B981",
          border: "none", 
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.7 : 1,
          maxWidth: "80%",
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        {draftCompleted ? (
          <i className="bi bi-envelope-open chat-icon"></i>
        ) : ( 
          <span className="chat-bounce"><i className="bi bi-envelope chat-icon"></i></span>
        )}
        <span>  {draftCompleted ? EmailCompletedText : EmailInProgressText}</span>
      </button>
    </div>
  );
}


