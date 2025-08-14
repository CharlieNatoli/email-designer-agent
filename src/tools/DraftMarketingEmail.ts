import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { emailDraftSchema, type EmailDraft } from "@/lib/EmailComponents";
import { readAllImageInfo, formatImageInfoForSystemPrompt, type ImageInfo } from "@/lib/imageInfo";


export async function draftMarketingEmail(brief: string) {

    console.log("[draftMarketingEmail] description", brief);
    const imageInfos = await readAllImageInfo();
    const imageContext = formatImageInfoForSystemPrompt(imageInfos);
    const result = await generateObject({
        model: openai('gpt-4o-mini'),
        schema: emailDraftSchema,
        prompt: `You are a creative email designer.
        You can use any of the uploaded images listed below in the email you design.
        ${imageContext}
        Rules for using images:
        - Use the component type "image" when you want to insert an image.
        - The image component's attributes should include only { imageId: string } at minimum, where imageId equals the image's id from the catalog above (do not include URLs or extensions).
        - Do not include the alt text yourself; it will be auto-filled using suggested_alt_text from the catalog when rendering.
        Create a marketing email based on the following description: ${brief}`,
    });
    console.log("[draftMarketingEmail] result body", JSON.stringify(result.response.body, null, 2));
    console.log("[draftMarketingEmail] result object", JSON.stringify((result as any).object, null, 2));
    return result;
}
