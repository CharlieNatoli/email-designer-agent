import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { emailDraftSchema } from "@/lib/EmailComponents";
import { readAllImageInfo, formatImageInfoForSystemPrompt } from "@/lib/imageInfo";


export async function draftMarketingEmail(brief: string) {

    console.log("[draftMarketingEmail] description", brief);
    const imageInfos = await readAllImageInfo();
    const imageContext = formatImageInfoForSystemPrompt(imageInfos);
    const result = await generateObject({
        model: openai('gpt-4o-mini'),
        schema: emailDraftSchema,
        prompt: `You are a creative email designer.
        Use the following catalog of uploaded images in case they are helpful. ${imageContext}
        Create a marketing email based on the following description: ${brief}`,
    });
    console.log("[draftMarketingEmail] result body", JSON.stringify(result.response.body, null, 2));
    console.log("[draftMarketingEmail] result object", JSON.stringify(result.object, null, 2));
  return result;
}