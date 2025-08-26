"use client";

import { useEffect, useId, useMemo, useState } from "react"; 
import EmailDraftInProgressNotice from "@/app/components/EmailDraftInProgressNotice";
import OpenPreviewButton from "@/app/components/OpenPreviewButton";
import PreviewDrawer from "@/app/components/PreviewDrawer";
import { compileMjmlToHtml, usePreviewDrawer } from "@/app/components/tool_display/ToolDisplayBase";
import HtmlPreviewTab from "@/app/components/tool_display/tabs/HtmlPreviewTab";
import MjmlCodeTab from "@/app/components/tool_display/tabs/MjmlCodeTab";
import { TOOL_RUN_STATUS, TOOL_NAME, type ToolRunStatus } from "@/types/ai";


type Props = {
  toolName: typeof TOOL_NAME.DraftMarketingEmail | typeof TOOL_NAME.EditMarketingEmail;
  status: ToolRunStatus;
  output?: string;
  text?: string;
};

export default function MarketingEmailDisplay({ toolName, status, output, text }: Props) {
  const instanceId = useId();
  const { isOpen, open, close } = usePreviewDrawer(instanceId);

  const [runningText, setRunningText] = useState(text); 
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  useEffect(() => {
    if (text) {
      setRunningText(prev => prev + text);
    }
    if (output) {
      setRunningText(output);
    }
  }, [text, output]);

  const compiledHtml = useMemo(() => {
    if (!isOpen) return null;
    if (activeTabId !== "preview") return null;
    if (!output) return null;
    return compileMjmlToHtml(output);
  }, [isOpen, activeTabId, output]);

  const startingText = toolName === TOOL_NAME.DraftMarketingEmail ? "Starting email draft…" : "Starting email edit…";
  if (status === TOOL_RUN_STATUS.starting ) {
    return  <EmailDraftInProgressNotice text={startingText} />
  }

  // completed
  return (
    <>
      <OpenPreviewButton onOpen={() => { setActiveTabId("preview"); open(); }} disabled={false} draftCompleted={TOOL_RUN_STATUS.done === status} toolName={toolName} />
      {/* Only build tabs and heavy children when drawer is open */}
      {isOpen ? (
        <PreviewDrawer
          isOpen={Boolean(isOpen)}
          onClose={close}
          tabs={[
            ...(output ? [{ id: "preview", label: "Preview", content: compiledHtml ? <HtmlPreviewTab compiledHtml={compiledHtml} /> : null }] : []),
            ...(runningText ? [{ id: "mjml", label: "MJML", content: <MjmlCodeTab mjml={runningText} /> }] : []),
          ]}
          initialTabId="preview"
          onActiveTabChange={(id) => setActiveTabId(id)}
        />
      ) : null}
    </>
  );
}


