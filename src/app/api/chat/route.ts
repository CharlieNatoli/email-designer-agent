import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const runtime = 'edge';

export async function POST(request: Request) {
  const { messages } = await request.json();

  console.log("messages", messages);

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    messages,
    temperature: 0.7,
  });

  // Return a simple text stream suitable for manual client consumption
  return result.toTextStreamResponse();
}


