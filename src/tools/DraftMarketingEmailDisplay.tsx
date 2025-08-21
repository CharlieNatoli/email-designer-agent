"use client";

import { useId } from "react"; 
import EmailDraftInProgressNotice from "@/app/components/EmailDraftInProgressNotice";
import OpenPreviewButton from "@/app/components/OpenPreviewButton";
import PreviewDrawer from "@/app/components/PreviewDrawer";
import { useCompiledMjml, usePreviewDrawer } from "@/app/components/ToolDisplayBase";
import HtmlPreviewTab from "@/app/components/tabs/HtmlPreviewTab";
import MjmlCodeTab from "@/app/components/tabs/MjmlCodeTab";

// MJML is compiled from a full MJML document string returned by the tool

type Props = {
  status:  "input-streaming" | "call" | "result" | "input-available";
  output?: string ;
  text?: string;
};

export default function DraftMarketingEmailToolDisplay({ status, output, text }: Props) {
  const instanceId = useId();
  const { isOpen, open, close } = usePreviewDrawer(instanceId);
  const mjmlString = typeof output === "string" ? output : text;
  const compiled = useCompiledMjml(mjmlString);

  console.log("[DraftMarketingEmailTool] status", status);
  console.log("[DraftMarketingEmailTool] result", output);
  console.log("[DraftMarketingEmailTool] text", text);

  

  if (status === "input-available") {
    return <EmailDraftInProgressNotice />;
  }

  // completed
  return (
    <>
      <OpenPreviewButton onOpen={() => { if (compiled) open(); }} disabled={!compiled} />
      <PreviewDrawer
        isOpen={Boolean(isOpen && compiled)}
        onClose={close}
        title="Preview"
        tabs={[
          { id: "preview", label: "Preview", content: <HtmlPreviewTab compiledHtml={compiled} /> },
          ...(mjmlString ? [{ id: "mjml", label: "MJML", content: <MjmlCodeTab mjml={mjmlString} /> }] : []),
        ]}
        initialTabId="preview"
      />
    </>
  );
}


