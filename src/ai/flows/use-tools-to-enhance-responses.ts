'use server';
/**
 * @fileOverview Implements a Genkit flow that uses external tools to enhance chatbot responses.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GetCurrentWeatherInputSchema = z.object({
    location: z.string().describe('The city and state, e.g. San Francisco, CA'),
});

const GetCurrentWeatherOutputSchema = z.object({
    temperature: z.number().describe('The current temperature in degrees Fahrenheit'),
    condition: z.string().describe('The current weather condition, e.g. sunny, cloudy, rain'),
});

// Defines the tool the AI can use
const getCurrentWeather = ai.defineTool(
    {
        name: 'getCurrentWeather',
        description: 'Gets the current weather for a location',
        inputSchema: GetCurrentWeatherInputSchema,
        outputSchema: GetCurrentWeatherOutputSchema,
    },
    async input => {
        console.log(`Getting weather for ${input.location}`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network latency
        return {
            temperature: 72,
            condition: 'Sunny',
        };
    }
);

const EnhancedChatbotInputSchema = z.object({
    query: z.string().describe('The user query.'),
});
export type EnhancedChatbotInput = z.infer<typeof EnhancedChatbotInputSchema>;

const EnhancedChatbotOutputSchema = z.object({
    response: z.string().describe('The chatbot response.'),
});
export type EnhancedChatbotOutput = z.infer<typeof EnhancedChatbotOutputSchema>;

export async function enhancedChatbotResponse(input: EnhancedChatbotInput): Promise<EnhancedChatbotOutput> {
    return enhancedChatbotResponseFlow(input);
}

// Defines the prompt and makes the tool available to the AI
const prompt = ai.definePrompt({
    name: 'enhancedChatbotPrompt',
    input: { schema: EnhancedChatbotInputSchema },
    output: { schema: EnhancedChatbotOutputSchema },
    tools: [getCurrentWeather],
    prompt: `You are a helpful chatbot. Use the provided tools to answer the user's query.

  If the user asks about the weather, use the getCurrentWeather tool to get the current weather for the location they specify.  If they do not specify a location, ask them for one.

  Query: {{query}}`,
});

// Wraps the prompt in a callable flow
const enhancedChatbotResponseFlow = ai.defineFlow(
    {
        name: 'enhancedChatbotResponseFlow',
        inputSchema: EnhancedChatbotInputSchema,
        outputSchema: EnhancedChatbotOutputSchema,
    },
    async input => {
        const { output } = await prompt(input);
        return output!;
    }
);
