"use client";

import { ReactNode, memo } from "react";

type Props = {
  compiledHtml: ReactNode;
};

function HtmlPreviewTabInternal({ compiledHtml }: Props) {
  return <div>{compiledHtml}</div>;
}

const HtmlPreviewTab = memo(HtmlPreviewTabInternal);
export default HtmlPreviewTab;


