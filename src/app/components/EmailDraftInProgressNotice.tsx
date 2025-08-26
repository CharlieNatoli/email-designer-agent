"use client";

export default function EmailDraftInProgressNotice({text}: {text: string}) {
  return (
    <div className="row gap-8 chat-bubble-base">
      <i className="bi bi-envelope" style={{ fontSize: 24 }}></i>
      <span className="text-strong pulse">{text}</span>
    </div>
  );
}


