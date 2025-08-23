"use client";

import { useId, useMemo, useState } from "react";
import EmailDraftInProgressNotice from "@/app/components/EmailDraftInProgressNotice";
import OpenPreviewButton from "@/app/components/OpenPreviewButton";
import PreviewDrawer from "@/app/components/PreviewDrawer";
import { useCompiledMjml, usePreviewDrawer } from "@/app/components/ToolDisplayBase";
import HtmlPreviewTab from "@/app/components/tabs/HtmlPreviewTab";
import IssuesTab from "@/app/components/tabs/IssuesTab";
import MjmlCodeTab from "@/app/components/tabs/MjmlCodeTab";

type CritiqueResult = {
  issues: Array<{ issue: string; severity: string; fix: string }>;
  fixedMJML: string;
};

// type Props = {
//   status: "input-streaming" | "call" | "result" | "input-available";
//   result?: CritiqueResult;
// };

export default function EditEmailToolDisplay({ part }: any) {

  return <div> EditEmailToolDisplay </div>
  // const instanceId = useId();
  // const { isOpen, open, close } = usePreviewDrawer(instanceId);
  // const fixedMjml = part?.data?.final ?? null;
  // const compiledFixed = useCompiledMjml(fixedMjml);

  // const issuesText = useMemo(() => {
  //   if (!result?.issues?.length) return "No issues detected.";
  //   return result.issues
  //     .map((it, idx) => `${idx + 1}. [S${it.severity}] ${it.issue}\nFix: ${it.fix}`)
  //     .join("\n\n");
  // }, [result]);

  // if (status === "input-available") {
  //   return <EmailDraftInProgressNotice />;
  // }

  // const canOpen = Boolean(result && (result.issues || result.fixedMJML));

  // return (
  //   <>
  //     <OpenPreviewButton onOpen={() => { if (canOpen) open(); }} disabled={!canOpen} label="Email critique ready" />
  //     <PreviewDrawer
  //       isOpen={Boolean(isOpen && canOpen)}
  //       onClose={close}
  //       title="Preview"
  //       tabs={[
  //         { id: "issues", label: "Issues", content: <IssuesTab issuesText={issuesText} /> },
  //         { id: "fixed", label: "Fixed email", content: <HtmlPreviewTab compiledHtml={compiledFixed} /> },
  //         ...(fixedMjml ? [{ id: "mjml", label: "MJML", content: <MjmlCodeTab mjml={fixedMjml} /> }] : []),
  //       ]}
  //       initialTabId="issues"
  //     />
  //   </>
  // );
}


