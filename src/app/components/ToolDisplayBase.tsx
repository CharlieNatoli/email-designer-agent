"use client";

import { useEffect, useMemo, useState } from "react";

// Global open-id registry so only one drawer across all tool displays can be open
let currentOpenId: string | null = null;
const subscribers = new Set<(id: string | null) => void>();

export function getOpenId() {
  return currentOpenId;
}

export function setOpenId(next: string | null) {
  currentOpenId = next;
  subscribers.forEach((fn) => fn(currentOpenId));
}

export function subscribe(listener: (id: string | null) => void) {
  subscribers.add(listener);
  return () => subscribers.delete(listener);
}

export function usePreviewDrawer(instanceId: string) {
  const [isOpen, setIsOpen] = useState<boolean>(getOpenId() === instanceId);

  useEffect(() => {
    const unsubscribe = subscribe((openId) => setIsOpen(openId === instanceId));
    return () => {
      if (getOpenId() === instanceId) setOpenId(null);
      unsubscribe();
    };
  }, [instanceId]);

  return {
    isOpen,
    open: () => setOpenId(instanceId),
    close: () => setOpenId(null),
  };
}

export function useCompiledMjml(mjml: string | null ) {
  return useMemo(() => {
    if (!mjml) return null;
    const mjml2html = require("mjml-browser");
    const { html } = mjml2html(mjml);
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }, [mjml]);
}


