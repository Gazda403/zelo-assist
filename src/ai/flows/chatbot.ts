'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const ChatbotInputSchema = z.object({
    query: z.string().describe('The user query.'),
    history: z.array(z.object({
        role: z.enum(['user', 'assistant'] as const), // Fix: use readonly array for enum
        content: z.string(),
    })).optional().describe("Conversation history")
});

export const ChatbotOutputSchema = z.object({
    response: z.string().describe('The chatbot response.'),
});

// Example Tool: Get Weather (as per reference, good for testing tools)
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
        // Mock response
        return {
            temperature: 72,
            condition: 'Sunny',
        };
    }
);

const chatbotPrompt = ai.definePrompt({
    name: 'chatbotPrompt',
    input: { schema: ChatbotInputSchema },
    tools: [getCurrentWeather],
    // Simple text prompt for now to ensure compatibility. 
    // Ideally we would loop over history, but for this 'enhanced response' snippet we'll just context dump or use basic concatenation.
    // Genkit 0.9+ templates support {{#each history}}...{{/each}} if using dotprompt, but standard template string is safer here.
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
        // Schema must match definePrompt output logic if structured, but here prompt returns text generation
        // Actually definePrompt returns a 'GenerateResponse'.
        outputSchema: ChatbotOutputSchema,
    },
    async (input) => {
        // The prompt execution returns the generate result
        const result = await chatbotPrompt(input);
        return { response: result.text };
    }
);
