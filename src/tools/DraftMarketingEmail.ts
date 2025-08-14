import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { readAllImageInfo, formatImageInfoForSystemPrompt } from "@/lib/imageInfo";


export async function draftMarketingEmail(brief: string) {

    console.log("[draftMarketingEmail] description", brief);
    const imageInfos = await readAllImageInfo();
    const imageContext = formatImageInfoForSystemPrompt(imageInfos);
    const result = await generateObject({
        model: openai('gpt-4o'),
        schema: z.object({
            emailDraftMJML: z.string().min(1).describe("Complete MJML document starting with <mjml> and containing <mj-body>"),
        }),
        prompt: `You are a creative email designer.

        You can use any of the uploaded images listed below in the email you design.
        ${imageContext}

        Output format:
        - Return a single field called emailDraftMJML containing a complete MJML document.
        - The MJML must start with <mjml> and include <mj-body> wrapping the entire email content.

        Rules for using images:
        - For images, reference the uploaded files by filename from the catalog above.
        - Set the image src to /uploads/<image-filename> where <image-filename> includes the extension, e.g. /uploads/abc123.jpg.
        - To use an image as a background, set the image src to /uploads/<image-filename> and use the background-url attribute in mj-section. You can then place text or other content over the image by placing those elements inside the mj-section.  
        - consider using the following attributes on the mj-section when using an image as a background, if you want to display the whole image in the background:
          background-size="contain" - scales the whole image into the container without cropping.
          background-repeat="no-repeat" - stops tiling.
          background-position="center center" - centers it both vertically and horizontally.


        Design guidelines:
        - Be creative and bold with layouts, visuals, and typography while staying on-brand.
        - Keep copy brief and skimmable; prefer short headlines and 1–2 sentence body text.
        - Include clear, actionable CTAs using compelling text.
        - Make the primary CTA prominent and near the top; add secondary CTAs if there are multiple actions the reader can take.
        - Structure content with clear sections and columns; use spacing and dividers to create rhythm and separation.

        Create a marketing email based on the following description:
        ${brief}`,
    });
    console.log("[draftMarketingEmail] result body", JSON.stringify(result.response.body, null, 2));
    console.log("[draftMarketingEmail] result object", JSON.stringify((result as any).object, null, 2));
    return result;
}
