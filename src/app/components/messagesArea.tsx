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
          const key = part.id ?? `${m.id}-text-${index}`;
          return (
            <div key={key} style={{ marginBottom: 12 }}>
              <MessageBubble role={m.role}>
                {part.text}
              </MessageBubble>
            </div>
          );
        } else if (part.type === "data-tool-run") {
          if (part.data?.tool === "DraftMarketingEmail") {
            return (
              <div key={part.id} style={{ marginBottom: 12 }}>
                <DraftMarketingEmailToolDisplay
                  text={part.data?.text}
                  output={part.data?.final}
                  status={part.data?.status}
                />
              </div>
            );
          } else if (part.data?.tool === "EditEmail") {
            return (
              <div key={part.id} style={{ marginBottom: 12 }}>
                <DraftMarketingEmailToolDisplay
                  text={part.data?.text}
                  output={part.data?.final}
                  status={part.data?.status}
                />
              </div>
            );
          }
        }
        return null;
      })}
    </div>
  );
}
const ThinkingRobot = () => (
  <div
    className="chat-text-base chat-left-pad"
    style={{ 
      opacity: 0.7, 
      marginTop: 8, 
      display: 'flex', 
      alignItems: 'center', 
      gap: 8 
    }}
  > 
    <i className="bi bi-robot chat-icon chat-bounce" />
    <span>Thinking...</span>
  </div>
);

export default function MessagesArea({ messages, status }: Props) {
  
  return (
    <>
      {messages.length === 0 && (
        <div style={{ opacity: 0.7, textAlign: "center", marginTop: 32, fontSize: 20, fontWeight: 600 }}> 
           Let's design a beautiful email together.
        </div>
      )}
      {messages.map((m: any) => renderMessage(m))}
      {status === "streaming" && (
        <ThinkingRobot />
      )}
    </>
  );
}


