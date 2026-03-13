import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const EmailRaterOutputSchema = z.object({
    urgencyScore: z.number(),
    reasoning: z.string(),
    confidence: z.enum(['low', 'medium', 'high']),
});

export const rateEmailFlow = ai.defineFlow(
    {
        name: 'rateEmailFlow',
        inputSchema: z.object({ subject: z.string(), snippet: z.string(), sender: z.string().optional() }),
        outputSchema: EmailRaterOutputSchema,
    },
    async (input) => {
        const { output } = await ai.generate({
            prompt: `Rate email urgency 1-10: Sub: ${input.subject}, Snippet: ${input.snippet}`,
            output: { schema: EmailRaterOutputSchema },
        });
        if (!output) throw new Error("Failed");
        return output;
    }
);
