import { renderEmailToPng } from "@/utils/screenshot";
import { z } from "zod";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

 export const EditToolInputSchema = z.object({
    userInstructions: z.string().describe("A brief description of the email to edit"),
    emailToEditID: z.string().describe(` 
      Id of the tool call to the DraftMarketingEmail tool that created the email to edit.
      Specifically, look for the message where type="data-tool-run" and data.tool="DraftMarketingEmail"
      You are looking for the "id" field of the message.




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

 