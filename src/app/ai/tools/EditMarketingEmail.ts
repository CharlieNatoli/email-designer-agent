import { renderEmailToPng } from "@/utils/screenshot";
import { z } from "zod";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { TOOL_NAME, TOOL_RUN_STATUS, type ModelMessageWithEmailToolResults } from "@/types/ai";




 export const EditToolInputSchema = z.object({
    userInstructions: z.string().describe("Repeat word for word the user's instructions for editing the email."),
    emailToEditID: z.string().describe(` 
Id of the tool call to the DraftMarketingEmail tool that created the email to edit.
Specifically, look for the message where type="data-tool-run" and data.tool="DraftMarketingEmail"
You are looking for the "id" field of the message.`),
 });

 export const editMarketingEmailSystemPrompt = `
 Please help the user edit an email. You will be given the MJML code of thhe email, a screenshot of the email, and the user's instructions for what to change.

Edit the email to match the user's instructions. DO NOT make any other changes to the email.

<image-context>
Images provided by the user:
{imageContext}
</image-context>

<final-output-format>
- Return only the MJML must start with <mjml> and include <mj-body> wrapping the entire email content. Return ONLY the MJML, no other text.
</final-output-format> `

export const editMarketingEmailToolDescription = `
Edit an email based on a creative brief.
`

/**
 * Extract email MJML from tool messages by scanning for DraftMarketingEmail and EditMarketingEmail tool outputs
 */
function extractEmailToEdit(modelMessages: ModelMessageWithEmailToolResults[], emailToEditID: string): string | undefined {
  let emailMjml: string | undefined;
  const validToolNames = [TOOL_NAME.DraftMarketingEmail, TOOL_NAME.EditMarketingEmail];
  
  try {
    const toolMessages = modelMessages.filter((message: any) => message?.role === "tool");

    for (const message of toolMessages) {
      const contentArray = Array.isArray((message as any)?.content) ? (message as any).content : [];
      for (const content of contentArray) {
        if (
          content &&
          typeof content === "object" &&
          (content as any).type === "tool-result" &&
          validToolNames.includes((content as any).toolName)
        ) {
          const output = (content as any).output;
          const value = output?.value;
          console.log("[editMarketingEmail] content", JSON.stringify(content, null, 2));
          if (value?.id === emailToEditID && typeof value?.artifact === "string") {
            emailMjml = value.artifact;
            break;
          }
        }
      }
      if (emailMjml) break;
    }
  } catch (err) {
    console.error("[editMarketingEmail] Failed while scanning messages for tool output", err);
  }
  
  return emailMjml;
}

 
export async function editMarketingEmail(
    writer: any, 
    userInstructions: string, 
    modelMessages: ModelMessageWithEmailToolResults[], 
    emailToEditID: string, 
) {   

  console.log("[editMarketingEmail] modelMessages", modelMessages);

    const id = crypto.randomUUID();
    // Start: show a persistent progress panel
    writer.write({
      type: 'data-tool-run',
      id,
      data: { tool: TOOL_NAME.EditMarketingEmail, status: TOOL_RUN_STATUS.starting, notes: ``},
    });
 
    // Resolve MJML to edit by scanning assistant message parts for DraftMarketingEmail or EditMarketingEmail tool outputs
    const emailMjml = extractEmailToEdit(modelMessages, emailToEditID);

    if (!emailMjml) {
      const errorMsg = `Could not find DraftMarketingEmail or EditMarketingEmail output for email id ${emailToEditID}`;
      console.error("[editMarketingEmail]", errorMsg, { emailToEditID });
      writer.write({
        type: 'data-tool-run',
        id,
        data: { tool: TOOL_NAME.EditMarketingEmail, status: TOOL_RUN_STATUS.error, text: errorMsg },
      });
      throw new Error(errorMsg);
    }

    console.log("[editMarketingEmail] found email MJML length", emailMjml.length);
    
    writer.write({
      type: 'data-tool-run',
      id,
      data: { tool: TOOL_NAME.EditMarketingEmail, status: TOOL_RUN_STATUS.starting, notes: 'Taking screenshot…' },
    });
 
    const { buffer, base64 } = await renderEmailToPng(emailMjml);
    console.log("[draftMarketingEmail] rendering", buffer);



    const result =  streamText({
        model: anthropic('claude-opus-20250219'),
        system: editMarketingEmailSystemPrompt,
        messages: [
            {
                role: "user",
                content: [
                    { 
                        type: "text", 
                        text: `MJML of email to be edited:\n\n${emailMjml}\n\n${userInstructions}`   
                    },
                    {
                        type: "image",
                        image: `data:image/png;base64,${base64}`, 
                    },
                ],
            }
        ],

    });

    for await (const delta of result.textStream) {
        writer.write({
          type: 'data-tool-run',
          id,
          data: { tool: TOOL_NAME.EditMarketingEmail, status: TOOL_RUN_STATUS.streaming, text: delta },
        });
      } 

    const final = await result.text;

    writer.write({
      type: 'data-tool-run',
      id,
      data: { tool: TOOL_NAME.EditMarketingEmail, status: TOOL_RUN_STATUS.done, final: final },
    });

      return { id, artifact: final };

}

 

