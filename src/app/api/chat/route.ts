import { streamText, generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import {
  DraftToolInputSchema,  
} from '@/lib/EmailComponents';
import { draftMarketingEmail } from '@/tools/DraftMarketingEmail';
import { readAllImageInfo, formatImageInfoForSystemPrompt } from '@/lib/imageInfo';

import { convertToModelMessages } from 'ai';


export const runtime = 'nodejs';

export async function POST(request: Request) {
  const { messages } = await request.json();

  const modelMessages = convertToModelMessages(messages);

  console.log("modelMessages", JSON.stringify(modelMessages, null, 2));

  const imageInfos = await readAllImageInfo();
  const imageContext = formatImageInfoForSystemPrompt(imageInfos);

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: `You are a creative email designer. Help the customer design an email. Use the DraftMarketingEmail tool to render the email if they ask for one.
    Also talk to the customer in a friendly and engaging way. After using the DraftMarketingEmail tool, summarize the email in natural language.
    
    ${imageContext}
    `,
    messages: modelMessages,
    temperature: 0.7,
    tools: {
      DraftMarketingEmail: {
        description: 'Render a marketing email based on a creative brief',
        inputSchema: DraftToolInputSchema,
        execute: async ({ brief }) => {
          const result = await draftMarketingEmail(brief);
          // Only return the serializable object for streaming to the client
          return result.object;
        },
      },
    },
  });

  // Return a simple text stream suitable for manual client consumption
  return result.toUIMessageStreamResponse();
}


