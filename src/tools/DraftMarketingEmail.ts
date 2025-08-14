// import { generateObject } from "ai";
// import { openai } from "@ai-sdk/openai";
// import { z } from "zod";


import { OpenAI } from "openai";
import { readAllImageInfo, formatImageInfoForSystemPrompt } from "@/lib/imageInfo";


export async function draftMarketingEmail(brief: string) {

    const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});
    

    console.log("[draftMarketingEmail] description", brief);
    const imageInfos = await readAllImageInfo();
    const imageContext = formatImageInfoForSystemPrompt(imageInfos);

    const systemPrompt = `You are a creative email designer.

        You can use any of the uploaded images listed below in the email you design.
        ${imageContext}

        Output format:
        - Return a single field called emailDraftMJML containing a complete MJML document.
        - The MJML must start with <mjml> and include <mj-body> wrapping the entire email content. Return ONLY the MJML, no other text.

        Rules for using images:
        - For images, reference the uploaded files by filename from the catalog above.
        - Set the image src to /uploads/<image-filename> where <image-filename> includes the extension, e.g. /uploads/abc123.jpg.
        - To use an image as a background, set the image src to /uploads/<image-filename> and use the background-url attribute in mj-section. You can then place text or other content over the image by placing those elements inside the mj-section.  

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
            You could ovelay buttons on top of each image by setting the background-image of each mj-column, or you could just have the plain images for a simpler but chic look. 
        

        Design guidelines:
        - Be creative and bold with layouts, visuals, and typography while staying on-brand.
        - Keep copy brief and skimmable; prefer short headlines and 1–2 sentence body text.
        - Include clear, actionable CTAs using compelling text.
        - Make the primary CTA prominent and near the top; add secondary CTAs if there are multiple actions the reader can take.
        - Structure content with clear sections and columns; use spacing and dividers to create rhythm and separation.

        Formatting guidelines: 
        - Avoid using padding for images, as it will crop the image. 
        - Use more padding for text, as it shouldn't be cropped to the edge of the image. 


        Create a marketing email based on the following description:
        ${brief}`
 
  
    const result = await openai.responses.create({
      model: "gpt-5-mini",
      input: systemPrompt,
      reasoning: {
        effort: "minimal"
      }
    });
    
    console.log(result.output_text);


    // const result = await generateObject({
    //     model: openai('gpt-4o'),
    //     schema: z.object({
    //         emailDraftMJML: z.string().min(1).describe("Complete MJML document starting with <mjml> and containing <mj-body>"),
    //     }),
    //     prompt: systemPrompt
    // });
    // console.log("[draftMarketingEmail] result body", JSON.stringify(result.response.body, null, 2));
    // console.log("[draftMarketingEmail] result object", JSON.stringify((result as any).object, null, 2));
    
    const regex = /<mjml>[\s\S]*<\/mjml>/;
    const match = result.output_text.match(regex);
    if (match) {
        console.log(match[0]); 
        return match[0];
    } else {
        console.log("No match found");
        return null;
    }
}
