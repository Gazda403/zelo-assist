import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { trackAiUsage } from "@/lib/ai-budget";

export interface UrgencyAnalysis {
    score: number;
    reason: string;
}

export interface DraftResponse {
    draft: string;
    tone: string;
}

/**
 * Analyzes an email and returns an urgency score (1-10) with reasoning.
 */
export async function analyzeEmailUrgency(
    subject: string,
    body: string,
    sender: string,
    userId?: string
): Promise<UrgencyAnalysis> {
    try {
        const model = google("gemini-1.5-flash");

        const prompt = `You are an AI email assistant. Analyze the following email and rate its urgency on a scale of 1-10.

Sender: ${sender}
Subject: ${subject}
Body: ${body}

Provide:
1. A score from 1-10 (10 = extremely urgent, 1 = not urgent at all)
2. A brief reason (max 10 words) explaining the urgency level

Consider factors like:
- Financial/billing issues (high urgency)
- Client requests (medium-high urgency)
- Newsletters/marketing (low urgency)
- Time-sensitive deadlines
- Sender importance

Respond in JSON format:
{
  "score": <number>,
  "reason": "<brief explanation>"
}`;

        const result = await generateText({
            model,
            prompt,
        });

        // Track token usage for billing
        if (userId && result.usage) {
            trackAiUsage(userId, result.usage.inputTokens ?? 0, result.usage.outputTokens ?? 0).catch(() => {});
        }

        // Parse JSON response
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                score: Math.min(10, Math.max(1, parsed.score)),
                reason: parsed.reason,
            };
        }

        // Fallback
        return { score: 5, reason: "Unable to analyze" };
    } catch (error) {
        console.error("Error analyzing urgency:", error);
        return { score: 5, reason: "Analysis failed" };
    }
}

/**
 * Generates a draft reply for an email.
 */
export async function generateDraftReply(
    subject: string,
    body: string,
    sender: string,
    context?: string,
    userId?: string
): Promise<DraftResponse> {
    try {
        const model = google("gemini-1.5-flash");

        const prompt = `You are an AI email assistant. Generate a professional draft reply to the following email.

Sender: ${sender}
Subject: ${subject}
Body: ${body}
${context ? `Additional Context: ${context}` : ""}

Generate a concise, professional reply. Keep it under 150 words. Be polite and actionable.

Respond in JSON format:
{
  "draft": "<email body>",
  "tone": "<professional|friendly|formal>"
}`;

        const result = await generateText({
            model,
            prompt,
        });

        // Track token usage for billing
        if (userId && result.usage) {
            trackAiUsage(userId, result.usage.inputTokens ?? 0, result.usage.outputTokens ?? 0).catch(() => {});
        }

        // Parse JSON response
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                draft: parsed.draft,
                tone: parsed.tone || "professional",
            };
        }

        // Fallback
        return {
            draft: "Thank you for your email. I will review this and get back to you shortly.",
            tone: "professional",
        };
    } catch (error) {
        console.error("Error generating draft:", error);
        return {
            draft: "Thank you for your email. I will review this and get back to you shortly.",
            tone: "professional",
        };
    }
}

/**
 * Generates a context-aware follow-up email.
 */
export async function generateFollowUpContent(
    originalSubject: string,
    originalBody: string,
    recipient: string,
    baseTemplate: string = "Hi, just checking if you saw my last email. Let me know if you have any questions.",
    userId?: string
): Promise<string> {
    try {
        const model = google("gemini-2.5-flash");

        // Truncate body to avoid hitting limits or distracting the model
        const snippet = originalBody.slice(0, 1000);

        const prompt = `You are an AI assistant drafting a polite follow-up email.

Original Sent Email:
Subject: ${originalSubject}
To: ${recipient}
Body Snippet: "${snippet}..."

Base Template: "${baseTemplate}"

Task:
Adjust the Base Template slightly to better fit the context of the Original Email.
- Keep it extremely brief (max 3 sentences).
- Maintain a polite and professional tone.
- Do NOT change the core meaning (it is a check-in).
- Do NOT make up new facts.

Return ONLY the body of the follow-up email. Do not include subject or signature placeholders like "[Your Name]".`;

        const result = await generateText({
            model,
            prompt,
        });

        // Track token usage for billing
        if (userId && result.usage) {
            trackAiUsage(userId, result.usage.inputTokens ?? 0, result.usage.outputTokens ?? 0).catch(() => {});
        }

        // Clean up response
        return result.text.trim();

    } catch (error) {
        console.error("Error generating follow-up:", error);
        // Fallback to base template
        return baseTemplate;
    }
}
