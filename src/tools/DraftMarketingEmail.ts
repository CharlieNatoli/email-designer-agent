
import { OpenAI } from "openai";
import { anthropic } from '@ai-sdk/anthropic';
import { streamText, generateText } from 'ai';

import { readAllImageInfo, formatImageInfoForSystemPrompt } from "@/lib/imageInfo"; 
 
const layoutsToConsider = `
Section layouts to consider:
    1. Full-width section with image background
        If you have an image with no text overlaid, you could use it as a background and put text or CTAs over it. 
        If you do this, use the following attributes on the mj-section:
        background-size="contain" - scales the whole image into the container without cropping.
        background-repeat="no-repeat" - stops tiling.
        background-position="center center" - centers it both vertically and horizontally.
        Also, consider where the text should go on the image and how to make sure it's readable. For example, if the top of the image is a light blue sky, maybe have darker text or a color like red or orange that contrasts well. 
    2. Zigzag layout
        If you have multiple product images, you could use a zigzag layout to display them.
        use multiple mj-sections with the columns each. Alternate having image on the left and text on the right, or vice versa.
        To spruce this up even more, consider adding buttons in each section, or having a section background color that matches the image. 
    3. Grid layout 
        Similar to the zigzag layout, but with a grid of images. 
        You could ovelay buttons on top of each image by setting the background-image of each mj-column, or you could just have the plain images for a simpler but chic look. `


export async function draftMarketingEmail(brief: string) {

    const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});
    

    console.log("[draftMarketingEmail] description", brief);
    const imageInfos = await readAllImageInfo();
    const imageContext = formatImageInfoForSystemPrompt(imageInfos);

    const systemPrompt = `You are a creative email design bot. Your job is to draft marketing emails that will be reviewed by a human marketing designer. 
These emails should fit well into the company's brand style, but also be unique and interesting. The goal is to give new ideas to the marketing team that they can take inspiration from. 
 
<images-available>
You can use any of the uploaded images listed below in the email you design.
${imageContext}

Rules for using images:
- For images, reference the uploaded files by filename from the catalog above.
- Set the image src to /uploads/<image-filename> where <image-filename> includes the extension, e.g. /uploads/abc123.jpg.
- To use an image as a background, set the image src to /uploads/<image-filename> and use the background-url attribute in mj-section. You can then place text or other content over the image by placing those elements inside the mj-section.
</images-available>

<design-guidelines>
General guidelines:
- Be creative and bold with layouts, visuals, and typography while staying on-brand.
- Include clear, actionable CTAs using compelling text.
- Make the primary CTA prominent and near the top; add secondary CTAs if there are multiple actions the reader can take. 
</design-guidelines>

<final-output-format>
- Return only the MJML must start with <mjml> and include <mj-body> wrapping the entire email content. Return ONLY the MJML, no other text.
</final-output-format `


    // const result = await openai.responses.create({
    //   model: "gpt-5-mini",
    //   instructions: systemPrompt, 
    //   input: brief,
    //   reasoning: {
    //     // effort: "high",
    //     // summary: "detailed"
    //     effort: "minimal",
    //     // summary: "concise"
    //   }
    // });
    
    // console.log("[draftMarketingEmail] result", result); 
    // // search for all items in result.output wheree type="reasoning", 
    // const reasoningText = result.output.find((item: any) => item.type === "reasoning");
    // console.log("[draftMarketingEmail] reasoning text", JSON.stringify(reasoningText, null, 2)); 
    const { text } = await generateText({
        model: anthropic('claude-opus-4-1-20250805'),
        prompt: systemPrompt
      });

    return text

    // const regex = /<mjml>[\s\S]*<\/mjml>/;
    // const match = result.output_text.match(regex);
    // if (match) {
    //     return match[0];
    // } else {
    //     console.log("No match found");
    //     return '';
    // }
}


