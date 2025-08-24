"use client";

export default function EmailDraftInProgressNotice() {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <i className="bi bi-envelope" style={{ fontSize: 24, opacity: 0.9 }}></i>
      <span style={{ opacity: 0.9 }}>Starting email draft.…</span>
      <style>{`@keyframes pulse{0%{opacity:0.6}50%{opacity:1}100%{opacity:0.6}}`}</style>
    </div>
  );
}


