"use client";

export default function EmailDraftInProgressNotice() {
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


