import { renderEmailToPng } from "@/utils/screenshot";
import { OpenAI } from "openai";



const critiqueEmailSystemPrompt = `
You are reviewing MJML email code that was written by an AI assistant. There are a few factors that could have caused problems.

<context>
The AI that created this email can only create it by wriiting MJML code, so it may end up with cases where visual elements look odd due to sizing. 
</context>

<guidelines> 
- List any areas where the email's visual layout looks odd, such as poor contrast, or weird spacing, or text that's cut off in a strange place. 
- Each suggestion should refer to one specific section of the email. 
- Suggest MJML code changes to fix these problems.  
- Stay witin the creator's original intent. Your goal is only to fix mistakes. 
</guidelines>

<output-format>
{
    "issues": [
        {
            "issue": "Mistake / issue description",
            "severity": "1-5",
            "fix": "What you'll do. Explain the exact MJML code changes you'd make."
        }
    ],
    "fixedMJML": " Output complete MJML with ALL fixes applied. Include comments before each fix: <!-- FIX: [explanation] -->"
}
</output-format>`


export async function getEmailCritique(base64: string, mjml: string) {

    const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

    const result = await openai.responses.create({
        model: "gpt-5-mini", 
        instructions: critiqueEmailSystemPrompt,
        input: [{
            role: "user", 
            content: [
                { 
                    type: "input_text", 
                    text: mjml  
                },
                {
                    type: "input_image",
                    image_url: `data:image/png;base64,${base64}`,
                    detail: "high",
                },
            ],
        }], 
    });
    
    console.log("[critiqueEmail] result", JSON.parse(result.output_text));
    return JSON.parse(result.output_text);


}


export async function critiqueEmail(optional_instructions: string, modelMessages: any) {   

    console.log("[critiqueEmail] optional_instructions", optional_instructions);
    console.log("[critiqueEmail] modelMessages", modelMessages);    

    const draftMarketingEmailResults = (modelMessages as any[])
        .filter(message => message.role === "tool")
        .flatMap(message => message.content)
        .filter(contentItem => contentItem.type === "tool-result" && (contentItem.toolName === "DraftMarketingEmail" || contentItem.toolName === "CritiqueEmail"));

    // 

    const lastMarketingMessageOutput = draftMarketingEmailResults[draftMarketingEmailResults.length - 1].output.value;
    console.log("[critiqueEmail] toolCall", lastMarketingMessageOutput); 

 
    const { buffer, base64 } = await renderEmailToPng(lastMarketingMessageOutput);
    console.log("[draftMarketingEmail] rendering", buffer);

    try {

        // TODO make these named arguments to clarify mjml = lastMarketingMessageOutput, base64 = base64

        const critique = await getEmailCritique(base64, lastMarketingMessageOutput);

        console.log("[draftMarketingEmail] critique issues", critique.issues);

        return critique;

    } catch (error) {
        console.error("[critiqueEmail] error", error);
        return "Error: " + error;
    }

}