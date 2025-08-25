"use client";

export default function EmailDraftInProgressNotice() {
  return (
    <div className="row gap-8">
      <i className="bi bi-envelope" style={{ fontSize: 24 }}></i>
      <span className="text-strong pulse">Starting email draft.…</span>
    </div>
  );
}


