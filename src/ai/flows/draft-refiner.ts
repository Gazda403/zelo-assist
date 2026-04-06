import { google } from "@ai-sdk/google";
import { generateWithFallback } from "@/ai/utils/generate-with-fallback";

export interface DraftRefinerInput {
    draft: string;
    instruction: string;
    emailContext?: {
        sender?: string;
        subject?: string;
        originalEmail?: string;
    };
}

export interface DraftRefinerOutput {
    refinedDraft: string;
    explanation: string;
}

/**
 * Refines an email draft based on user instructions.
 * Uses Vercel AI SDK with Google Gemini for consistency with other AI features.
 */
export async function refineDraftFlow(input: DraftRefinerInput): Promise<DraftRefinerOutput> {
    const { draft, instruction, emailContext } = input;

    try {
        const modelPrimary = google("gemini-2.5-flash");
        const modelFallback = google("gemini-1.5-flash");

        const contextSection = emailContext ? `
# Email Context
Replying To: ${emailContext.sender || 'Unknown'}
Subject: ${emailContext.subject || 'No Subject'}
Original Email: ${emailContext.originalEmail || 'N/A'}
` : '';

        const prompt = `You are an expert executive assistant and email editor. You understand and can work with emails in any language.

${contextSection}

# Current Draft
"${draft}"

# User Instruction
"${instruction}"

# CRITICAL - Language Rule
The draft reply must remain in the same language as the original email (if provided in context).
You may receive the user's instruction in any language (Serbian, German, Norwegian, etc.) — understand it and apply it, but keep the draft in the language of the original email.
If no original email is provided, keep the draft in whatever language it is currently in.
Default to English only if the language cannot be determined.

# Task
1. Modify the draft according to the user's instruction
2. Maintain a professional tone unless asked otherwise
3. Ensure clarity and conciseness
4. Provide a brief explanation of what you changed (explanation can be in English)

Respond in JSON format:
{
  "refinedDraft": "<the updated email draft in the correct language>",
  "explanation": "<brief explanation of changes made>"
}`;

        console.log('[Draft Refiner] Calling Gemini API...');

        const { text } = await generateWithFallback({
            modelPrimary,
            modelFallback,
            prompt,
        });

        console.log('[Draft Refiner] API response received');

        // Parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                refinedDraft: parsed.refinedDraft || draft,
                explanation: parsed.explanation || "Draft updated successfully",
            };
        }

        console.warn('[Draft Refiner] Failed to parse JSON, using fallback');

        // Fallback: return original draft with explanation
        return {
            refinedDraft: draft,
            explanation: "Unable to parse AI response. Please try again.",
        };

    } catch (error) {
        console.error('[Draft Refiner] Error:', error);

        // Detailed error logging
        if (error instanceof Error) {
            console.error('[Draft Refiner] Error name:', error.name);
            console.error('[Draft Refiner] Error message:', error.message);
            console.error('[Draft Refiner] Error stack:', error.stack);
        }

        // Return original draft on error
        throw new Error(`Failed to refine draft: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
