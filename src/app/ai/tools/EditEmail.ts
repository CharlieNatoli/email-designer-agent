import { renderEmailToPng } from "@/utils/screenshot";
import { z } from "zod";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { TOOL_NAME, TOOL_RUN_STATUS } from "@/types/ai";

 export const EditToolInputSchema = z.object({
    userInstructions: z.string().describe("Repeat word for word the user's instructions for editing the email."),
    emailToEditID: z.string().describe(` 
Id of the tool call to the DraftMarketingEmail tool that created the email to edit.
Specifically, look for the message where type="data-tool-run" and data.tool="DraftMarketingEmail"
You are looking for the "id" field of the message.`),
 });

 export const editEmailSystemPrompt = `
 Please help the user edit an email. You will be given the MJML code of thhe email, a screenshot of the email, and the user's instructions for editing the email.

Edit the email to match the user's instructions. DO NOT make any other changes to the email.

<image-context>
Images provided by the user:
{imageContext}
</image-context>

<final-output-format>
- Return only the MJML must start with <mjml> and include <mj-body> wrapping the entire email content. Return ONLY the MJML, no other text.
</final-output-format> `

export const editEmailToolDescription = `
Edit an email based on a creative brief.
`

 
export async function editEmail(
    writer: any, 
    userInstructions: string, 
    modelMessages: any[], 
    emailToEditID: string, 
) {   

    const id = crypto.randomUUID();
    // Start: show a persistent progress panel
    writer.write({
      type: 'data-tool-run',
      id,
      data: { tool: TOOL_NAME.EditEmail, status: TOOL_RUN_STATUS.starting, text: `Planning: ${userInstructions}\n` },
    });
 
    // Resolve MJML to edit by scanning assistant message parts for the DraftMarketingEmail tool output
    let emailMjml: string | undefined;
    try {
      const toolMessages = modelMessages.filter((message: any) => {
        if (message?.role !== "tool") return false;
        const contentArray = Array.isArray(message?.content) ? message.content : [];
        return contentArray.some((part: any) =>
          part?.type === "tool-result" && part?.toolName === "DraftMarketingEmail"
        );
      });

      for (const message of toolMessages) {
        const contentArray = Array.isArray(message?.content) ? message.content : [];
        for (const content of contentArray) {
          console.log("[editEmail] content", JSON.stringify(content, null, 2));
          if (content?.type === "tool-result" && content?.output?.value?.id === emailToEditID) {
            emailMjml = content?.output?.value?.artifact;
            break;
          }
        }
        if (emailMjml) break;
      }
    } catch (err) {
      console.error("[editEmail] Failed while scanning messages for tool output", err);
    }

    if (!emailMjml) {
      const errorMsg = `Could not find DraftMarketingEmail output for email id ${emailToEditID}`;
      console.error("[editEmail]", errorMsg, { emailToEditID });
      writer.write({
        type: 'data-tool-run',
        id,
        data: { tool: TOOL_NAME.EditEmail, status: TOOL_RUN_STATUS.error, text: errorMsg },
      });
      throw new Error(errorMsg);
    }

    console.log("[editEmail] found email MJML length", emailMjml.length);
    
    writer.write({
      type: 'data-tool-run',
      id,
      data: { tool: TOOL_NAME.EditEmail, status: TOOL_RUN_STATUS.starting, text: 'Taking screenshot…' },
    });
 
    const { buffer, base64 } = await renderEmailToPng(emailMjml);
    console.log("[draftMarketingEmail] rendering", buffer);



    const result =  streamText({
        model: anthropic('claude-sonnet-4-20250514'),
        system: editEmailSystemPrompt,
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
          data: { tool: TOOL_NAME.EditEmail, status: TOOL_RUN_STATUS.streaming, text: delta },
        });
      } 

    const final = await result.text;

    writer.write({
      type: 'data-tool-run',
      id,
      data: { tool: TOOL_NAME.EditEmail, status: TOOL_RUN_STATUS.done, final: final },
    });

      return { id, artifact: final };

}

 