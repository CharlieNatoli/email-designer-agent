"use client";

import MessageBubble from "@/app/components/MessageBubble";
import MarketingEmailDisplay from "@/app/components/tool_display/MarketingEmailDisplay";
import { TOOL_NAME, TOOL_RUN_STATUS, type MessagePart, type UIMessage } from "@/types/ai";

type Props = {
  messages: UIMessage[];
  status: string;
};

function renderMessage(m: UIMessage ) {

  return (
    <div key={m.id}>
      {m.parts?.map((part: MessagePart , index: number) => {
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
          if (part.data?.tool === TOOL_NAME.DraftMarketingEmail || part.data?.tool === TOOL_NAME.EditMarketingEmail) {
            return (
              <div key={part.id} style={{ marginBottom: 12 }}>
                <MarketingEmailDisplay
                  toolName={part.data?.tool}
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
  <div className="chat-text-base chat-left-pad row gap-8 text-muted mt-8">
    <i className="bi bi-robot chat-icon chat-bounce" />
    <span>Thinking...</span>
  </div>
);

export default function MessagesArea({ messages, status }: Props) {

  console.log("[MessagesArea] messages", messages);
  
  return (
    <>
      {messages.length === 0 && (
        <div className="text-muted text-lg" style={{ textAlign: "center", marginTop: 32, fontWeight: 600 }}>
           Let's design a beautiful email together.
        </div>
      )}
      {messages.map((m: UIMessage) => renderMessage(m))}
      {status === TOOL_RUN_STATUS.streaming && (
        <ThinkingRobot />
      )}
    </>
  );
}


