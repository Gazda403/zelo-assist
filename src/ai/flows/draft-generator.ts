import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { generateWithFallback } from "@/ai/utils/generate-with-fallback";

export interface DraftGeneratorInput {
    sender: string;
    senderEmail: string;
    subject: string;
    emailBody: string;
    knowledgeBase?: string; // NEW: Context from bot policies
    intent?: string;        // NEW: Detected intent (sorting)
    instructions?: string   // NEW: Bot-specific instructions
}

export interface DraftGeneratorOutput {
    draft: string;
    tone: string;
}

/**
 * Generates an initial draft reply for an email.
 * Uses Vercel AI SDK with Google Gemini.
 */
export async function generateDraftFlow(input: DraftGeneratorInput): Promise<DraftGeneratorOutput> {
    const { sender, senderEmail, subject, emailBody, knowledgeBase } = input;

    try {
        const modelPrimary = google("gemini-2.5-flash");
        // Fallback to Groq for generous free tier if Gemini hits quota
        const modelFallback = groq("llama-3.3-70b-versatile");

        const prompt = `You are an AI email assistant. Generate a professional draft reply to the following email.
${input.instructions ? `\n# Custom Instructions / Bot Persona\nFollow these specific rules for your response:\n${input.instructions}\n` : ''}

# Email Details
From: ${sender} <${senderEmail}>
Subject: ${subject}
Body: ${emailBody}
${input.intent ? `Detected Intent: ${input.intent.replace(/_/g, ' ')}\n` : ''}

${knowledgeBase ? `# Knowledge Base / Policies\nUse this information to answer questions accurately:\n${knowledgeBase}\n` : ''}

# CRITICAL - Language Rule
Carefully detect the language of the email Subject and Body above.
You MUST write your reply in THE EXACT SAME LANGUAGE as the original email.
Examples:
- If the email is in Norwegian (Bokmål or Nynorsk) → reply in Norwegian
- If the email is in Serbian (Srpski) → reply in Serbian
- If the email is in German (Deutsch) → reply in German
- If the email is in French, Spanish, Italian, Dutch, etc. → reply in that language
- If the email is in English or the language cannot be determined → reply in English
This language rule overrides all other instructions.

# Instructions
1. Generate a concise, professional reply (under 150 words)
2. Be polite, helpful, and actionable
3. Match the tone of the original email
${input.intent ? `4. Address the detected intent (${input.intent.replace(/_/g, ' ')}) specifically based on policies.\n` : ''}
5. If the email requires specific information you don't have, acknowledge receipt and indicate you'll follow up
6. ${knowledgeBase ? 'Use the provided Knowledge Base to answer specific questions if applicable.' : ''}

Respond in JSON format:
{
  "draft": "<email body text in the detected language>",
  "tone": "<professional|friendly|formal>"
}`;

        console.log('[Draft Generator] Generating draft for email from:', sender);

        const { text } = await generateWithFallback({
            modelPrimary,
            modelFallback,
            prompt,
        });

        console.log('[Draft Generator] Draft generated successfully');

        // Parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                draft: parsed.draft || "Thank you for your email. I will review this and get back to you shortly.",
                tone: parsed.tone || "professional",
            };
        }

        console.warn('[Draft Generator] Failed to parse JSON, using fallback');

        // Fallback response
        return {
            draft: "Thank you for your email. I will review this and get back to you shortly.",
            tone: "professional",
        };

    } catch (error) {
        console.error('[Draft Generator] Error:', error);

        // Detailed error logging
        if (error instanceof Error) {
            console.error('[Draft Generator] Error name:', error.name);
            console.error('[Draft Generator] Error message:', error.message);
        }

        // Return friendly fallback on error
        return {
            draft: `Dear ${sender},\n\nThank you for your email regarding "${subject}". I've received your message and will review it carefully.\n\nI'll get back to you shortly with a detailed response.\n\nBest regards`,
            tone: "professional",
        };
    }
}
