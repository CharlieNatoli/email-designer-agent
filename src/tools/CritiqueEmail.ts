import { renderEmailToPng } from "@/utils/screenshot";
import { OpenAI } from "openai";


export async function getEmailCritique(base64: string) {

    const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

    const systemPrompt = `
    You are a creative email design bot. 
    Your job is to critique the following email design and provide feedback on what is good and what is bad. 
    `
    const result = await openai.responses.create({
        model: "gpt-5-mini", 
        input: [{
            role: "user",
            content: [
                { 
                    type: "input_text", 
                    text: systemPrompt
                },
                {
                    type: "input_image",
                    image_url: `data:image/png;base64,${base64}`,
                    detail: "high",
                },
            ],
        }], 
    });
    
    console.log("[critiqueEmail] result", result.output_text);
    return result.output_text;


}


export async function critiqueEmail(optional_instructions: string, modelMessages: any) {   

    console.log("[critiqueEmail] optional_instructions", optional_instructions);
    console.log("[critiqueEmail] modelMessages", modelMessages);    

    const draftMarketingEmailResults = (modelMessages as any[])
        .filter(message => message.role === "tool")
        .flatMap(message => message.content)
        .filter(contentItem => contentItem.type === "tool-result" && contentItem.toolName === "DraftMarketingEmail");

    // 

    const lastMarketingMessageOutput = draftMarketingEmailResults[draftMarketingEmailResults.length - 1].output.value;
    console.log("[critiqueEmail] toolCall", lastMarketingMessageOutput); 

 
    const { buffer, base64 } = await renderEmailToPng(lastMarketingMessageOutput);
    console.log("[draftMarketingEmail] rendering", buffer);

    try {

    const critique = await getEmailCritique(base64);
    console.log("[draftMarketingEmail] critique", critique);

    return critique;

    } catch (error) {
        console.error("[critiqueEmail] error", error);
        return "Error: " + error;
    }

}