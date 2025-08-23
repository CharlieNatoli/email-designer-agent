import { renderEmailToPng } from "@/utils/screenshot";
import { z } from "zod";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

 export const EditToolInputSchema = z.object({
    userInstructions: z.string().describe("A brief description of the email to edit"),
    emailToEditID: z.string().describe(`
        toolCallId of the email to edit, as returned by the DraftMarketingEmail tool. 
        Specfiically,look for the message where role="tool" and toolName="DraftMarketingEmail".
        This should be a random string of letters and numbers prefixed with 'call_'.
        Include the 'call_' prefix in the toolCallId.
        For example, "call_q5A0RCjXq900G7Av5gMnUuM7"
          `),
 });

 export const editEmailSystemPrompt = `
 You are a creative email designer. Help the customer edit an email.  
 You will be given an ID of an email to edit, and brief instructions on what to edit.
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
      data: {  tool: 'editEmail', status: 'starting', text: `Planning: ${userInstructions}\n` },
    });
 

    console.log("[editEmail] emailToEditID", emailToEditID);
    console.log("[editEmail] userInstructions", userInstructions);
    console.log("[editEmail] modelMessages", JSON.stringify(modelMessages, null, 2));   
    
    // Resolve MJML to edit by scanning assistant message parts for the DraftMarketingEmail tool output
    let emailMjml: string | undefined;
    try {
      const assistantMessages = Array.isArray(modelMessages)
        ? modelMessages.filter((m: any) => m?.role === "assistant" && Array.isArray(m?.parts))
        : [];

      for (const message of assistantMessages) {
        for (const part of message.parts) {
          if (part?.type === "tool-DraftMarketingEmail" && part?.toolCallId === emailToEditID) {
            emailMjml = part?.output?.artifact;
            break;
          }
        }
        if (emailMjml) break;
      }
    } catch (err) {
      console.error("[editEmail] Failed while scanning messages for tool output", err);
    }

    if (!emailMjml) {
      const errorMsg = `Could not find DraftMarketingEmail output for toolCallId ${emailToEditID}`;
      console.error("[editEmail]", errorMsg, { emailToEditID });
      writer.write({
        type: 'data-tool-run',
        id,
        data: { tool: 'editEmail', status: 'error', text: errorMsg },
      });
      throw new Error(errorMsg);
    }

    console.log("[editEmail] found email MJML length", emailMjml.length);
    
    writer.write({
        type: 'data-tool-run',
        id,
        data: {  tool: 'editEmail', status: 'taking-screenshot' },
      });
 
    const { buffer, base64 } = await renderEmailToPng(emailMjml);
    console.log("[draftMarketingEmail] rendering", buffer);



    const result =  streamText({
        model: anthropic('claude-sonnet-4-20250514'),
        system: editEmailSystemPrompt, // TODO - add image context
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
          data: {  tool: 'editEmail', status: 'streaming', text: delta },
        });
      } 

    const final = await result.text;

    writer.write({
        type: 'data-tool-run',
        id,
        data: { tool: 'editEmail', status: 'done' , final: final },
      });

      return { id, artifact: final };

}

 