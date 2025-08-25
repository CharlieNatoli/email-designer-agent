
import { anthropic } from '@ai-sdk/anthropic';

import { streamText } from 'ai';
import { z } from 'zod';

import { getImageContextForSystemPrompt } from "@/lib/imageInfo"; 

export const draftMarketingEmailSystemPrompt = `You are a creative email design bot. Your job is to draft marketing emails that will be reviewed by a human marketing designer. 
These emails should fit well into the company's brand style, but also be unique and interesting. The goal is to give new ideas to the marketing team that they can take inspiration from. 
 
<images-available>
You can use any of the uploaded images listed below in the email you design.
{imageContext}

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
</final-output-format>`


export const draftMarketingEmailToolDescription = `
Draft a marketing email based on a creative brief.
`

export type DraftMarketingEmailToolOutput = {
  id: string;
  artifact: string;
} 


export const DraftToolInputSchema = z.object({
    brief: z.string().describe("repeat the description of the email from the customer in the chat so far. "),
  });

export async function draftMarketingEmail(writer: any, brief: string) {
 
    const id = crypto.randomUUID();
    // Start: show a persistent progress panel
    writer.write({
      type: 'data-tool-run',
      id,
      data: {  tool: 'DraftMarketingEmail', status: 'starting', text: `Planning: ${brief}\n` },
    });

    const imageContext = await getImageContextForSystemPrompt();


    const result =  streamText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: draftMarketingEmailSystemPrompt.replace('{imageContext}', imageContext), 
      prompt: brief,

  });

    for await (const delta of result.textStream) {
      writer.write({
        type: 'data-tool-run',
        id,
        data: {  tool: 'DraftMarketingEmail',status: 'streaming', text: delta },
      });
    }

    const final = await result.text;

    writer.write({
      type: 'data-tool-run',
      id,
      data: { tool: 'DraftMarketingEmail', status: 'done' , final: final },
    });

    // The tool's formal output (not streamed)
    return { id, artifact: final }; 

}


