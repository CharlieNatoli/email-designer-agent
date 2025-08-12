import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { emailDraftSchema } from "@/lib/EmailComponents";


export async function draftMarketingEmail(brief: string) {

    console.log("[draftMarketingEmail] description", brief);
    const result = await generateObject({
        model: openai('gpt-4o-mini'),
        schema: emailDraftSchema,
        prompt: `You are a creative email designer. 
        Create a marketing email based on the following description: ${brief}`,
    });

    console.log("[draftMarketingEmail] result body", JSON.stringify(result.response.body, null, 2));
    console.log("[draftMarketingEmail] result object", JSON.stringify(result.object, null, 2));
  return result;
}