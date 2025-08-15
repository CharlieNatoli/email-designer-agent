"use client";

import { useEffect, useId, useMemo, useState } from "react"; 
import { createPortal } from "react-dom";
import EmailDraftInProgressNotice from "@/app/components/EmailDraftInProgressNotice";
import OpenPreviewButton from "@/app/components/OpenPreviewButton";
import PreviewDrawer from "@/app/components/PreviewDrawer";

// MJML is compiled from a full MJML document string returned by the tool

// Module-scoped registry to ensure only one preview drawer is open at a time
let currentOpenId: string | null = null;
const subscribers = new Set<(id: string | null) => void>();

function getOpenId() {
  return currentOpenId;
}

function setOpenId(next: string | null) {
  currentOpenId = next;
  subscribers.forEach((fn) => fn(currentOpenId));
}

function subscribe(listener: (id: string | null) => void) {
  subscribers.add(listener);
  return () => subscribers.delete(listener);
}

type Props = {
  status:  "input-streaming" | "call" | "result" | "input-available";
  result?: { emailDraftMJML: string };
};

export default function DraftMarketingEmailToolDisplay({ status, result }: Props) {
  const instanceId = useId();
  const [isOpen, setIsOpen] = useState<boolean>(getOpenId() === instanceId);

  useEffect(() => {
    const unsubscribe = subscribe((openId) => setIsOpen(openId === instanceId));
    return () => {
      if (getOpenId() === instanceId) setOpenId(null);
      unsubscribe();
    };
  }, [instanceId]);

  const compiled = useMemo(() => {
    if (!result ) return null;
    const mjml = result;
    var mjml2html = require('mjml-browser');
    const { html } = mjml2html(mjml);
    console.log("[DraftMarketingEmailTool] mjml", mjml);
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }, [result]);

  console.log("[DraftMarketingEmailTool] status", status);
  console.log("[DraftMarketingEmailTool] result", result);
  

  if (status === "input-available") {
    return <EmailDraftInProgressNotice />;
  }

  // completed
  return (
    <>
      <OpenPreviewButton onOpen={() => { if (compiled) setOpenId(instanceId); }} disabled={!compiled} />
      <PreviewDrawer isOpen={Boolean(isOpen && compiled)} onClose={() => setOpenId(null)} title="Preview">
        {compiled}
      </PreviewDrawer>
    </>
  );
}


