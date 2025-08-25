import type { ModelMessage } from "ai";


export const TOOL_NAME = {
  DraftMarketingEmail: "DraftMarketingEmail",
  EditMarketingEmail: "EditMarketingEmail",
} as const;
export type ToolName = typeof TOOL_NAME[keyof typeof TOOL_NAME];

export const TOOL_RUN_STATUS = {
  starting: "starting",
  streaming: "streaming",
  done: "done",
  error: "error",
} as const;
export type ToolRunStatus = typeof TOOL_RUN_STATUS[keyof typeof TOOL_RUN_STATUS];

export type ToolRunData = {
  tool: ToolName;
  status: ToolRunStatus;
  text?: string;
  final?: string;
};

export type DataToolRunPart = {
  type: "data-tool-run";
  id: string;
  data: ToolRunData;
};

export type TextPart = {
  type: "text";
  id?: string;
  text: string;
};

export type MessagePart = TextPart | DataToolRunPart;

export enum MessageRole {
  user = "user",
  assistant = "assistant",
  system = "system",
  tool = "tool",
}

export type UIMessage = {
  id: string;
  role: MessageRole;
  parts?: MessagePart[];
};

// Minimal tool-result content types for our two tools
export type ToolArtifact = { id: string; artifact: string };

export type DraftMarketingEmailToolResult = {
  type: "tool-result";
  toolName: typeof TOOL_NAME.DraftMarketingEmail;
  output: { type: "json"; value: ToolArtifact };
};

export type EditMarketingEmailToolResult = {
  type: "tool-result";
  toolName: typeof TOOL_NAME.EditMarketingEmail;
  output: { type: "json"; value: ToolArtifact };
};

export type AnyEmailToolResult = DraftMarketingEmailToolResult | EditMarketingEmailToolResult;

// ModelMessage augmented to allow our tool results in the content array
export type ModelMessageWithEmailToolResults = Omit<ModelMessage, "content"> & {
  content?: Array<AnyEmailToolResult | unknown>;
};

