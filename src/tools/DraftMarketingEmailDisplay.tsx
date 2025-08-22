"use client";

import { useEffect, useId, useState } from "react"; 
import EmailDraftInProgressNotice from "@/app/components/EmailDraftInProgressNotice";
import OpenPreviewButton from "@/app/components/OpenPreviewButton";
import PreviewDrawer from "@/app/components/PreviewDrawer";
import { useCompiledMjml, usePreviewDrawer } from "@/app/components/ToolDisplayBase";
import HtmlPreviewTab from "@/app/components/tabs/HtmlPreviewTab";
import MjmlCodeTab from "@/app/components/tabs/MjmlCodeTab";


type Props = {
  status:  "input-streaming" | "call" | "result" | "input-available";
  output?: string ;
  text?: string;
};

export default function DraftMarketingEmailToolDisplay({ status, output, text }: Props) {
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
    compiledHtml = useCompiledMjml(output);
  }

  if (status === "input-available") {
    return <EmailDraftInProgressNotice />;
  }

  // completed
  return (
    <>
      <OpenPreviewButton onOpen={() => open()} disabled={false} />
       <div> {runningText} </div>
      <PreviewDrawer
        isOpen={Boolean(isOpen)}
        onClose={close}
        title="Preview"
        tabs={[
          ...(compiledHtml ? [{ id: "preview", label: "Preview", content: <HtmlPreviewTab compiledHtml={compiledHtml} /> }] : []),
          ...(runningText ? [{ id: "mjml", label: "MJML", content: <MjmlCodeTab mjml={runningText} /> }] : []),
        ]}
        initialTabId="preview"
      />
    </>
  );
}


