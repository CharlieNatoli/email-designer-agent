"use client";

type OpenPreviewButtonProps = {
  onOpen: () => void;
  disabled?: boolean;
  label?: string;
  draftCompleted?: boolean;
};

export default function OpenPreviewButton({ onOpen, disabled = false, draftCompleted = false}: OpenPreviewButtonProps) {

  console.log("draftCompleted", draftCompleted);
  
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
        <span>  {draftCompleted ? "Open preview" : "Email draft in progress..."}</span>
      </button>
    </div>
  );
}


