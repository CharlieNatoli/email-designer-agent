// Shared types for AI tool-run events and message parts

export const TOOL_NAME = {
  DraftMarketingEmail: "DraftMarketingEmail",
  EditEmail: "EditEmail",
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

// TODO - does tis part come from the ai-sdk?
export type UIMessage = {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  parts?: MessagePart[];
};


