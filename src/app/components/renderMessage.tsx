"use client";

import MessageBubble from "@/app/components/MessageBubble";
import DraftMarketingEmailToolDisplay from "@/app/components/tool_display/DraftMarketingEmailDisplay";
import type { MessagePart, UIMessage } from "@/types/ai";

export function renderMessage(m: UIMessage | any) {
  return (
    <div key={m.id}>
      {m.parts?.map((part: MessagePart | any) => {
        if (part.type === "text") {
          return (
            <MessageBubble role={m.role} key={"text-" + part.id}>
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
      })}
    </div>
  );
}
