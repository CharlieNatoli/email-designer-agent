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
        onClick={onOpen}
        disabled={disabled}
        style={{
          background: "#10B981",
          color: "white",
          border: "none", 
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.7 : 1,
          padding: "12px 14px",
          borderRadius: 12,
          maxWidth: "80%",
          whiteSpace: "pre-wrap",
          lineHeight: 1.5,
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        {draftCompleted ? (
          <i 
            className="bi bi-envelope"
            style={{
              fontSize: "24px",
            }} 
          ></i> 
        ) : ( 
          <span
            style={{
              display: "inline-block",
              animation: "bounce 1.2s ease-in-out infinite",
              willChange: "transform",
            }}
          >
            <i 
              className="bi bi-envelope"
              style={{
                fontSize: "24px",
              }} 
            ></i>
          </span>
        )}
        <span>  {draftCompleted ? "Open preview" : "Email draft in progress..."}</span>
      </button>
    </div>
  );
}


