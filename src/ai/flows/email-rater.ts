import { z } from 'zod';
import { groq } from "@ai-sdk/groq";
import { generateText } from 'ai';

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

type EmailRaterInput = z.infer<typeof EmailRaterInputSchema>;

export async function rateEmailFlow(input: EmailRaterInput) {
    const { subject, snippet, sender } = input;

    const prompt = `(Role: Expert Executive Assistant — multilingual, fluent in all languages)
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

IMPORTANT: YOU MUST RETURN ONLY RAW, VALID JSON MATCHING THIS EXACT EXACT STRUCTURE:
{
  "urgencyScore": 5,
  "reasoning": "Explanation here",
  "confidence": "low" | "medium" | "high"
}
NO MARKDOWN FENCES, NO COMMENTS, NO EXTRA TEXT BEFORE OR AFTER THE JSON OBJECT.`;

    const { text } = await generateText({
        model: groq("llama-3.3-70b-versatile"),
        prompt,
    });

    let object;
    try {
        let cleaned = text.trim();
        if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
        else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
        if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
        cleaned = cleaned.trim();
        
        const match = cleaned.match(/\{[\s\S]*\}/);
        const jsonStr = match ? match[0] : cleaned;
        
        object = JSON.parse(jsonStr);
    } catch (e) {
        console.error('[AI] Groq JSON parse failed, raw output:', text);
        throw new Error('Failed to parse AI response as JSON');
    }

    return object;
}
