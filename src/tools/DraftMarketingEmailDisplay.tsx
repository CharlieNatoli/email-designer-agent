"use client";

import { useId } from "react"; 
import EmailDraftInProgressNotice from "@/app/components/EmailDraftInProgressNotice";
import OpenPreviewButton from "@/app/components/OpenPreviewButton";
import PreviewDrawer from "@/app/components/PreviewDrawer";
import { useCompiledMjml, usePreviewDrawer } from "@/app/components/ToolDisplayBase";

// MJML is compiled from a full MJML document string returned by the tool

type Props = {
  status:  "input-streaming" | "call" | "result" | "input-available";
  result?: string | { emailDraftMJML: string };
};

export default function DraftMarketingEmailToolDisplay({ status, result }: Props) {
  const instanceId = useId();
  const { isOpen, open, close } = usePreviewDrawer(instanceId);
  const mjmlString = typeof result === "string" ? result : result?.emailDraftMJML ?? null;
  const compiled = useCompiledMjml(mjmlString);

  console.log("[DraftMarketingEmailTool] status", status);
  console.log("[DraftMarketingEmailTool] result", result);
  

  if (status === "input-available") {
    return <EmailDraftInProgressNotice />;
  }

  // completed
  return (
    <>
      <OpenPreviewButton onOpen={() => { if (compiled) open(); }} disabled={!compiled} />
      <PreviewDrawer isOpen={Boolean(isOpen && compiled)} onClose={close} title="Preview">
        {compiled}
      </PreviewDrawer>
    </>
  );
}


