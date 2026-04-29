import { z } from 'zod';
import { google } from '@ai-sdk/google';
import { groq } from '@ai-sdk/groq';
import { generateObjectWithFallback } from '@/ai/utils/generate-with-fallback';

const ContextAnalyzerOutputSchema = z.object({
    sentiment: z.enum(['positive', 'negative', 'neutral', 'frustrated', 'urgent']),
    topics: z.array(z.string()),
    isTopicChanged: z.boolean().optional(),
    confidence: z.number(),
});

type ContextAnalyzerInput = {
    subject: string;
    body: string;
    previousContext?: string;
};

type ContextAnalyzerOutput = z.infer<typeof ContextAnalyzerOutputSchema>;

/**
 * Analyzes email context: sentiment, topics, and topic-change detection.
 * Uses Vercel AI SDK with Gemini primary and Groq fallback.
 */
export async function analyzeEmailContext(input: ContextAnalyzerInput): Promise<ContextAnalyzerOutput> {
    const { subject, body, previousContext } = input;

    const modelPrimary = google('gemini-1.5-flash');
    const modelFallback = groq('llama-3.3-70b-versatile');

    const prompt = `Analyze the following email content.

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

Return a JSON object matching exactly these keys: "sentiment" (string), "topics" (array of strings), "isTopicChanged" (boolean, optional), "confidence" (number).`;

    try {
        const { object } = await generateObjectWithFallback<ContextAnalyzerOutput>({
            modelPrimary,
            modelFallback,
            schema: ContextAnalyzerOutputSchema,
            prompt,
        });

        return object as ContextAnalyzerOutput;
    } catch (error) {
        console.error('[Context Analyzer] Both models failed:', error);
        // Return a safe default so the bot engine doesn't crash
        return {
            sentiment: 'neutral',
            topics: [],
            isTopicChanged: false,
            confidence: 0,
        };
    }
}
