import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const EmailRaterInputSchema = z.object({
    subject: z.string(),
    snippet: z.string(),
    sender: z.string().optional(),
});

export const EmailRaterOutputSchema = z.object({
    urgencyScore: z.number().describe("A score from 1 to 10 indicating how urgent this email is."),
    reasoning: z.string().describe("A concise explanation for the urgency score."),
    confidence: z.enum(['low', 'medium', 'high']).describe("Confidence level in the rating."),
});

export const rateEmailFlow = ai.defineFlow(
    {
        name: 'rateEmailFlow',
        inputSchema: EmailRaterInputSchema,
        outputSchema: EmailRaterOutputSchema,
    },
    async (input) => {
        const { subject, snippet, sender } = input;

        // We use generate to directly get structured output
        const { output } = await ai.generate({
            prompt: `(Role: Expert Executive Assistant — multilingual, fluent in all languages)
            Analyze the following email metadata and determine its urgency score (1-10), reasoning, and confidence.
            The email subject/snippet may be in any language (Norwegian, Serbian, German, French, etc.) — understand it fully and rate it accurately regardless of language.
      
            # Data
            Sender: ${sender || 'Unknown'}
            Subject: ${subject}
            Snippet: ${snippet}
            
            # Rubric
            1-3:  Informational, Newsletter, No Action Needed. (Low Priority)
            4-6:  Action required but flexible timing. Normal business comms. (Medium Priority)
            7-8:  Time-sensitive. Needs action today or tomorrow. (High Priority)
            9-10: Critical! Server down, immediate deadline, boss requiring instant reply. (Critical)
            
            # Guidelines
            - Bias Safety: Do NOT infer urgency solely from sender authority (e.g. CEO) unless the content demands it.
            - Emotional Safety: Do NOT treat emotional language as urgency unless actual deadlines/consequences are present.
            - Choose the LOWEST score that accurately fits the category.
            - If data is insufficient (only snippet), set confidence to 'low'.
            - Always respond with the JSON output schema regardless of the email language.`,
            output: { schema: EmailRaterOutputSchema },
        });

        if (!output) {
            throw new Error("Failed to generate email rating");
        }

        return output;
    }
);
