import { createUIMessageStream, streamText, generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import {
  DraftToolInputSchema,  
} from '@/lib/EmailComponents';
import {  draftMarketingEmailSystemPrompt } from '@/tools/DraftMarketingEmail';
import { readAllImageInfo, formatImageInfoForSystemPrompt } from '@/lib/imageInfo';

import { convertToModelMessages } from 'ai';
import { editEmail, EditToolInputSchema } from '@/tools/EditEmail';
import { createUIMessageStreamResponse, stepCountIs } from 'ai';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const { messages } = await request.json();

  const modelMessages = convertToModelMessages(messages);

  console.log("modelMessages", JSON.stringify(modelMessages, null, 2));

  const imageInfos = await readAllImageInfo();
  const imageContext = formatImageInfoForSystemPrompt(imageInfos);

  const stream = createUIMessageStream({
    async execute({ writer }) {
      const result = streamText({
        model: openai('gpt-4o-mini'),
        messages: convertToModelMessages(messages),
        system: `You are a creative email designer. Help the customer design an email. Use the DraftMarketingEmail tool to render the email if they ask for one.
        Also talk to the customer in a friendly and engaging way. After using the DraftMarketingEmail tool, summarize the email in natural language.
        
        ${imageContext}
        `,
        
        tools: { 
          DraftMarketingEmail: {
            description: 'Render a marketing email based on a creative brief',
            inputSchema: DraftToolInputSchema, 
            execute: async ({ brief }) => {

              const id = crypto.randomUUID();
              // Start: show a persistent progress panel
              writer.write({
                type: 'data-tool-run',
                id,
                data: {  tool: 'DraftMarketingEmail', status: 'starting', text: `Planning: ${brief}\n` },
              });
    

              const result =  streamText({
                model: anthropic('claude-sonnet-4-20250514'),
                system: draftMarketingEmailSystemPrompt, // TODO - add image context
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
            },
          }, 
        //   EditEmail: {
        //     description: 'Edit an email based on a creative brief',
        //     inputSchema: EditToolInputSchema,
        //     execute: async ({ brief }) => {
        //       return await editEmail(brief, modelMessages);
        //     },
        //   },
        },
        stopWhen: stepCountIs(10),
      });

      writer.merge(result.toUIMessageStream());
    },
  });

  return createUIMessageStreamResponse({ stream });
}


