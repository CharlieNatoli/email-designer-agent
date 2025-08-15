"use client";

type OpenPreviewButtonProps = {
  onOpen: () => void;
  disabled?: boolean;
  label?: string;
};

export default function OpenPreviewButton({ onOpen, disabled = false, label = "Email draft ready" }: OpenPreviewButtonProps) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <div style={{ fontSize: 13, opacity: 0.8 }}>{label}</div>
      <button
        onClick={onOpen}
        disabled={disabled}
        style={{
          background: "#10B981",
          color: "white",
          border: "none",
          borderRadius: 8,
          padding: "6px 10px",
          cursor: disabled ? "not-allowed" : "pointer",
          fontSize: 13,
          opacity: disabled ? 0.7 : 1,
        }}
      >
        Open preview
      </button>
    </div>
  );
}


