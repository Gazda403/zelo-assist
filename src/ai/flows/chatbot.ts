'use server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const ChatbotInputSchema = z.object({
    query: z.string().describe('The user query.'),
    history: z.array(z.object({
        role: z.enum(['user', 'assistant'] as const),
        content: z.string(),
    })).optional().describe("Conversation history")
});

export const ChatbotOutputSchema = z.object({
    response: z.string().describe('The chatbot response.'),
});

const GetCurrentWeatherInputSchema = z.object({
    location: z.string().describe('The city and state, e.g. San Francisco, CA'),
});

const getCurrentWeather = ai.defineTool(
    {
        name: 'getCurrentWeather',
        description: 'Gets the current weather for a location',
        inputSchema: GetCurrentWeatherInputSchema,
        outputSchema: z.object({
            temperature: z.number(),
            condition: z.string(),
        }),
    },
    async (input) => {
        return { temperature: 72, condition: 'Sunny' };
    }
);

const chatbotPrompt = ai.definePrompt({
    name: 'chatbotPrompt',
    input: { schema: ChatbotInputSchema },
    tools: [getCurrentWeather],
    prompt: `You are Gmail Secretary, a helpful AI assistant.
  
  {{#if history}}
  Previous conversation:
  {{#each history}}
  {{role}}: {{content}}
  {{/each}}
  {{/if}}

  Current Query: {{query}}`
});

export const chatbotFlow = ai.defineFlow(
    {
        name: 'chatbotFlow',
        inputSchema: ChatbotInputSchema,
        outputSchema: ChatbotOutputSchema,
    },
    async (input) => {
        const result = await chatbotPrompt(input);
        return { response: result.text };
    }
);
