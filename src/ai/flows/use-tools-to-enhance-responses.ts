'use server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const getCurrentWeather = ai.defineTool({
    name: 'getCurrentWeather',
    description: 'Weather tool',
    inputSchema: z.object({ location: z.string() }),
    outputSchema: z.object({ temperature: z.number(), condition: z.string() }),
}, async input => ({ temperature: 72, condition: 'Sunny' }));

const prompt = ai.definePrompt({
    name: 'enhancedChatbotPrompt',
    input: { schema: z.object({ query: z.string() }) },
    output: { schema: z.object({ response: z.string() }) },
    tools: [getCurrentWeather],
    prompt: `Help with: {{query}}`,
});

export const enhancedChatbotResponseFlow = ai.defineFlow({
    name: 'enhancedChatbotResponseFlow',
    inputSchema: z.object({ query: z.string() }),
    outputSchema: z.object({ response: z.string() }),
}, async input => {
    const { output } = await prompt(input);
    return output!;
});
