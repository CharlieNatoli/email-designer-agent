import { createUIMessageStream, streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic'; 
import {  draftMarketingEmail, draftMarketingEmailToolDescription, DraftToolInputSchema } from '@/tools/DraftMarketingEmail';
import { readAllImageInfo, formatImageInfoForSystemPrompt } from '@/lib/imageInfo';

import { convertToModelMessages } from 'ai';
import { editEmail, editEmailToolDescription, EditToolInputSchema } from '@/tools/EditEmail';
import { createUIMessageStreamResponse, stepCountIs } from 'ai';

const systemPrompt = `You are a creative email designer. Help the customer design an email. 
Use the DraftMarketingEmail tool to create the email if they ask for one. 
If they ask for an edit, use the EditEmail tool.
Also talk to the customer in a friendly and engaging way. After using either tool, repond in no more tan 20 words. Do not summarize the email.

{imageContext}
`

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const { messages } = await request.json();

  const modelMessages = convertToModelMessages(messages);

  const imageInfos = await readAllImageInfo();
  const imageContext = formatImageInfoForSystemPrompt(imageInfos);

  const stream = createUIMessageStream({
    async execute({ writer }) {
      const result = streamText({
        model: anthropic('claude-sonnet-4-20250514'),
        messages: convertToModelMessages(messages),
        system: systemPrompt.replace('{imageContext}', imageContext),
        
        tools: { 
          DraftMarketingEmail: {
            description: draftMarketingEmailToolDescription,
            inputSchema: DraftToolInputSchema, 
            execute: async ({ brief }: { brief: string }) => {
              return await draftMarketingEmail(writer, brief);
 
            },
          }, 
          EditEmail: {
            description: editEmailToolDescription,
            inputSchema: EditToolInputSchema,
            execute: async ({ userInstructions, emailToEditID }: { userInstructions: string; emailToEditID: string }) => {
              return await editEmail(writer, userInstructions, modelMessages, emailToEditID);
            },
          },
        },
        stopWhen: stepCountIs(10),
      });

      writer.merge(result.toUIMessageStream());
    },
  });

  return createUIMessageStreamResponse({ stream });
}


