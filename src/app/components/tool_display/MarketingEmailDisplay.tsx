"use client";

import { useEffect, useId, useState } from "react"; 
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

  useEffect(() => {
    if (text) {
      setRunningText(prev => prev + text);
    }
    if (output) {
      setRunningText(output);
    }
  }, [text, output]);

  let compiledHtml = null;
 
  if (output) {
    compiledHtml = compileMjmlToHtml(output);
  }

  if (status === TOOL_RUN_STATUS.starting ) {
    return  <EmailDraftInProgressNotice />
  }

  // completed
  return (
    <>
      <OpenPreviewButton onOpen={() => open()} disabled={false} draftCompleted={TOOL_RUN_STATUS.done === status} toolName={toolName} />
      <PreviewDrawer
        isOpen={Boolean(isOpen)}
        onClose={close}
        tabs={[
          ...(compiledHtml ? [{ id: "preview", label: "Preview", content: <HtmlPreviewTab compiledHtml={compiledHtml} /> }] : []),
          ...(runningText ? [{ id: "mjml", label: "MJML", content: <MjmlCodeTab mjml={runningText} /> }] : []),
        ]}
        initialTabId="preview"
      />
    </>
  );
}


