"use client";

import MessageBubble from "@/app/components/MessageBubble";
import DraftMarketingEmailToolDisplay from "@/app/components/tool_display/DraftMarketingEmailDisplay";
import type { MessagePart, UIMessage } from "@/types/ai";

type Props = {
  messages: any[];
  status: string;
};

function renderMessage(m: UIMessage | any) {
  return (
    <div key={m.id}>
      {m.parts?.map((part: MessagePart | any, index: number) => {
        if (part.type === "text") {
          // Only render final text states to avoid duplicates during streaming
          if (part.state && part.state !== "done") return null;
          const key = part.id ?? `${m.id}-text-${index}`;
          return (
            <MessageBubble role={m.role} key={key}>
              {part.text}
            </MessageBubble>
          );
        } else if (part.type === "data-tool-run") {
          if (part.data?.tool === "DraftMarketingEmail") {
            return (
              <DraftMarketingEmailToolDisplay
                key={part.id}
                text={part.data?.text}
                output={part.data?.final}
                status={part.data?.status}
              />
            );
          } else if (part.data?.tool === "EditEmail") {
            return (
              <DraftMarketingEmailToolDisplay
                key={part.id}
                text={part.data?.text}
                output={part.data?.final}
                status={part.data?.status}
              />
            );
          }
        }
        return null;
      })}
    </div>
  );
}

export default function MessagesArea({ messages, status }: Props) {

  // TODO - chat no longer streaming. 
  // TODO - nicer "thinking" message
  
  return (
    <>
      {messages.length === 0 && (
        <div style={{ opacity: 0.7, textAlign: "center", marginTop: 32 }}>
          Start a conversation below.
        </div>
      )}
      {messages.map((m: any) => renderMessage(m))}
      {status === "streaming" && (
        <div style={{ opacity: 0.7, marginTop: 8 }}>Thinking…</div>
      )}
    </>
  );
}


