import { renderEmailToPng } from "@/utils/screenshot";
import { OpenAI } from "openai";



const critiqueEmailSystemPrompt = `
You are reviewing MJML email code that was written by an AI assistant. There are a few factors that could have caused problems.


<context>
The AI that created this email:
- Cannot see actual image dimensions or aspect ratios, which sometimes leads to images where the padding or placement of the image looks off. 
- Cannot see how text contrasts against image backgrounds, which sometimes leads to text that is hard to read.
- Cannot preview spacing between elements, which sometimes leads to elements that are too close together.
- Tends to write too much copy. 
- Cannot see how text will look, sometimes leading to too much whitespace, or boring-looking text.

Your job:
- Suggest MJML code changes to fix these problems. Your goal is to make the email look more professional and polished.
</context>

<critical-fixes-in-order>

1. IMAGE OVERLAY TEXT FIXES
Check EVERY instance of text over images:

PROBLEM: Text overlaid on images that already have text
FIXES:
- remove text overlay altogether. 
- add some text below the image, if there isn't a clear CTA on the image iteself. 

PROBLEM: Text overlaid on images has insufficient contrast.
FIXES:
- make text larger
- move text to another location on the image that better contrasts with the background. 
- add a background color to the text.
- add a semi-transparent dark overlay (background-color="rgba(0,0,0,0.6)")  

Safe approach: When in doubt, NEVER overlay text on product/lifestyle images.

2. IMAGE DIMENSION FIXES
Check EVERY image placement:

TOO MUCH WHITE SPACE AROUND IMAGES:
- if image in column has too much white space above or below, reduce size of other columns (eg. reduce text size)
- if image in column is too wide/landscape oriented, move to full-width section
- if image has too much padding and looks too small, remove padding

3. HERO/HEADER FIXES
Check the first section:

BAD: Small image, thin image, or text-heavy hero
GOOD: Large image OR bold text (pick one, not both)

If hero has image + lots of text:
- Remove the text, keep image OR
- Remove the image, make text bigger (font-size="48px")

Safe hero template:
<mj-section padding="0">
  <mj-column>
    <mj-image src="/uploads/[hero-image]" padding="0" />
    <mj-text font-size="24px" padding="20px">[5 words max]</mj-text>
    <mj-button>[CTA - 3 words]</mj-button>
  </mj-column>
</mj-section>

4. SPACING EMERGENCY FIXES
Add padding between ALL adjacent elements:

BUTTONS: 
- Never put 2 buttons in same section without padding
- Add padding="10px" minimum to all buttons
- If 2 CTAs near each other → padding="20px" between
 
5. COPY LENGTH FIXES
Ruthlessly cut text:

HERO: Maximum 8 words total
SECTION HEADERS: Maximum 5 words
BODY TEXT: Maximum 20 words per block
DESCRIPTIONS: Delete entirely if image shows the product

Apply this reduction:
- Count words in each text block
- If >20 words → Cut to first sentence only
- If describing what's visible in image → Delete
- If "marketing fluff" → Delete

Examples:
BAD: "Discover our amazing collection of handcrafted quilts made with love"
GOOD: "Handcrafted quilts"

BAD: "Join us for an exclusive event where you'll enjoy demos, treats, and prizes"  
GOOD: "Demos, treats, prizes"

6. COPY FORMATTING: 
- If text looks too boring, add new colors, fonts, spacing, etc. 
- If there's too much whitespace, add padding or font size.  
</critical-fixes-in-order>

<output-format>
{
    "issues": [
        {
            "issue": "Issue description",
            "severity": "1-5",
            "fix": "What you'll do"
        }
    ],
    "fixedMJML": " Output complete MJML with ALL fixes applied. Include comments before each fix: <!-- FIX: [explanation] -->"
}
</output-format>
 
`


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
                    text: "Please critique the following email design. Here is the MJML:\n" + mjml  
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
        .filter(contentItem => contentItem.type === "tool-result" && contentItem.toolName === "DraftMarketingEmail");

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