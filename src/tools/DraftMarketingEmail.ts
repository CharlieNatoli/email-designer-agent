import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { emailDraftSchema, type EmailDraft } from "@/lib/EmailComponents";
import { readAllImageInfo, formatImageInfoForSystemPrompt, type ImageInfo } from "@/lib/imageInfo";


export async function draftMarketingEmail(brief: string) {

    console.log("[draftMarketingEmail] description", brief);
    const imageInfos = await readAllImageInfo();
    const imageContext = formatImageInfoForSystemPrompt(imageInfos);
    const result = await generateObject({
        model: openai('gpt-4o'),
        schema: emailDraftSchema,
        prompt: `You are a creative email designer.

        You can use any of the uploaded images listed below in the email you design.
        ${imageContext}
        Rules for using images:
        - Use the component type "image" when you want to insert an image.
        - The image component's attributes should include only { image_filename: string } at minimum, where image_filename equals the full filename (including extension) from the catalog above, e.g. "abc123.jpg".
        - Do not include the alt text yourself; it will be auto-filled using suggested_alt_text from the catalog when rendering.

        Design guidelines:
        - Be creative and bold with layouts, visuals, and typography while staying on-brand.
        - Keep copy brief and skimmable; prefer short headlines and 1–2 sentence body text.
        - Include clear, actionable CTAs using the "button" component with compelling text.
        - Make the primary CTA prominent and near the top; add secondary CTAs if there are multiple actions the reader can take.
        - Structure content with "section" and "column" components; use "spacer" and "divider" to create rhythm and separation.

        Create a marketing email based on the following description: 
        ${brief}`,
    });
    console.log("[draftMarketingEmail] result body", JSON.stringify(result.response.body, null, 2));
    console.log("[draftMarketingEmail] result object", JSON.stringify((result as any).object, null, 2));
    return result;
}
