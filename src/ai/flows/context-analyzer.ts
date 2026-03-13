import { ai } from '../genkit';
import { z } from 'genkit';

export const analyzeEmailContext = ai.defineFlow(
    {
        name: 'analyzeEmailContext',
        inputSchema: z.object({
            subject: z.string(),
            body: z.string(),
            previousContext: z.string().optional(),
        }),
        outputSchema: z.object({
            sentiment: z.enum(['positive', 'negative', 'neutral', 'frustrated', 'urgent']),
            topics: z.array(z.string()),
            isTopicChanged: z.boolean().optional(),
            confidence: z.number(),
        }),
    },
    async (input) => {
        const { subject, body, previousContext } = input;
        const prompt = `Analyze the following email content.
            Subject: ${subject}
            Body: ${body}
            ${previousContext ? `Previous Context: ${previousContext}` : ''}
            Determine Sentiment, Topics, TopicShift, and Confidence. Return JSON.`;

        const { output } = await ai.generate({
            prompt,
            output: {
                format: 'json',
                schema: z.object({
                    sentiment: z.enum(['positive', 'negative', 'neutral', 'frustrated', 'urgent']),
                    topics: z.array(z.string()),
                    isTopicChanged: z.boolean().optional(),
                    confidence: z.number(),
                })
            }
        });
        if (!output) throw new Error('Failed to generate analysis');
        return output;
    }
);
