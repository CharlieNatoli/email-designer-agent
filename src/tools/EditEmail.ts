import { renderEmailToPng } from "@/utils/screenshot";
import { OpenAI } from "openai";
import { z } from "zod";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

 export const EditToolInputSchema = z.object({
    userInstructions: z.string().describe("A brief description of the email to edit"),
    emailToEditID: z.string().describe("Unique ID of the email to edit, as returned by the DraftMarketingEmail tool"),
 });

 export const editEmailSystemPrompt = `
 You are a creative email designer. Help the customer design an email. Use the DraftMarketingEmail tool to render the email if they ask for one.
 Also talk to the customer in a friendly and engaging way. After using the DraftMarketingEmail tool, summarize the email in natural language.
 `

 
export async function editEmail(writer: any, userInstructions: string, modelMessages: any[], emailToEditID: string) {   


    const id = crypto.randomUUID();
    // Start: show a persistent progress panel
    writer.write({
      type: 'data-tool-run',
      id,
      data: {  tool: 'editEmail', status: 'starting', text: `Planning: ${userInstructions}\n` },
    });
 

    console.log("[editEmail] userInstructions", userInstructions);
    console.log("[editEmail] modelMessages", modelMessages);   
    
    // get email from ID
    const emailToEdit = modelMessages.find(message => message.role === "tool" && message.content.type === "tool-result" && message.content.toolName === "DraftMarketingEmail" && message.content.output.value === emailToEditID);

    console.log("[editEmail] emailToEdit", emailToEdit);
     

 
    const { buffer, base64 } = await renderEmailToPng(emailToEdit);
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
                        text: `email to be edited: ${emailToEdit}.\n\n${userInstructions}`   
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

    return final;

 