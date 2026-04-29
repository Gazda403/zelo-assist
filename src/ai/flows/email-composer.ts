import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { generateWithFallback } from "@/ai/utils/generate-with-fallback";

export interface EmailComposerInput {
    recipientEmail: string;
    recipientName?: string;
    subject?: string;
    userInstruction: string; // What the user wants to achieve, e.g. "pitch golf balls"
}

export interface EmailComposerOutput {
    subject: string;
    draft: string;
    tone: string;
}

/**
 * Composes a brand new outbound email from scratch based on the user's instruction.
 * This is NOT a reply — it generates a fresh email the user wants to SEND.
 */
export async function composeNewEmailFlow(input: EmailComposerInput): Promise<EmailComposerOutput> {
    const { recipientEmail, recipientName, subject, userInstruction } = input;

    const recipientLabel = recipientName || recipientEmail || 'the recipient';

    try {
        const modelPrimary = google("gemini-1.5-flash");
        const modelFallback = groq("llama-3.3-70b-versatile");

        const prompt = `You are an AI email writing assistant. Your job is to compose a brand new outbound email on behalf of the user.

# Task
The user wants to send an email to: ${recipientLabel} (${recipientEmail})
${subject ? `Intended subject: ${subject}` : ''}

# User's goal / instruction:
"${userInstruction}"

# Context
- This is a NEW email being composed from scratch, NOT a reply.
- The user is the SENDER. They want to reach out to ${recipientLabel}.
- Write the full email body as if the user is writing to ${recipientLabel} for the first time.
- Do NOT reference receiving any prior email. Do NOT say "thank you for your email" or "I appreciate your message".
- Write a compelling, professional email that achieves the user's stated goal.

# Instructions
1. Craft a well-structured outbound email (greeting, purpose, call to action, closing).
2. Keep it concise (under 200 words) but impactful.
3. If the user wants to pitch/sell something, make it persuasive and benefit-focused.
4. If no subject is provided, generate an appropriate one based on the goal.
5. Match tone to the goal (e.g. sales = confident, request = polite, outreach = warm).
6. Address the recipient naturally by name if provided, or with a generic professional greeting.

# STRICT Formatting Rules
- Do NOT include conversational AI filler like "Certainly, here is a draft..." or "Here is the email you requested".
- The "draft" field must ONLY contain the body of the email (greeting, message, sign-off).
- Do NOT put "Subject:" inside the "draft" field. The subject goes ONLY in the "subject" field.
- Return ONLY valid JSON, nothing else.

Respond in JSON format:
{
  "subject": "<email subject line>",
  "draft": "<full email body>",
  "tone": "<professional|friendly|sales|formal>"
}`;

        console.log('[Email Composer] Composing new email for:', recipientEmail);

        const { text } = await generateWithFallback({
            modelPrimary,
            modelFallback,
            prompt,
        });

        // Parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                subject: parsed.subject || subject || "Hello",
                draft: parsed.draft || "I'm reaching out because I'd love to connect.",
                tone: parsed.tone || "professional",
            };
        }

        console.warn('[Email Composer] Failed to parse JSON, using fallback');
        return {
            subject: subject || "Hello",
            draft: `Dear ${recipientLabel},\n\n${userInstruction}\n\nBest regards`,
            tone: "professional",
        };

    } catch (error) {
        console.error('[Email Composer] Error:', error);
        return {
            subject: subject || "Hello",
            draft: `Dear ${recipientLabel},\n\nI hope this message finds you well. I'm reaching out regarding the following:\n\n${userInstruction}\n\nI'd love to connect and discuss further. Please let me know if you're available for a quick call.\n\nBest regards`,
            tone: "professional",
        };
    }
}
