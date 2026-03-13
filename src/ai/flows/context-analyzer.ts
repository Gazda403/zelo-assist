import { ai } from './genkit';
import { z } from 'genkit';

export const analyzeEmailContext = ai.defineFlow(
    {
        name: 'analyzeEmailContext',
        inputSchema: z.object({
            subject: z.string(),
            body: z.string(),
            previousContext: z.string().optional(), // For topic change detection
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

        const prompt = `
            Analyze the following email content.
            
            Subject: ${subject}
            Body: ${body}
            ${previousContext ? `Previous Context/Thread Summary: ${previousContext}` : ''}

            Determine the following:
            1. Sentiment: strictly one of 'positive', 'negative', 'neutral', 'frustrated', 'urgent'.
               - 'frustrated' should be used if the user seems angry, annoyed, or complaining.
               - 'urgent' should be used if the user is demanding immediate action.
            2. Main Topics: List up to 3 key topics discussed.
            3. Topic Changed: If previous context is provided, has the main topic shifted significantly? (true/false)
            4. Confidence: 0.0 to 1.0 score of your analysis.

            Return JSON.
        `;

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

        if (!output) {
            throw new Error('Failed to generate analysis');
        }

        return output;
    }
);
