'use server';

import { auth } from '@/auth';
import { google } from '@ai-sdk/google';
import { groq } from '@ai-sdk/groq';
import { generateWithFallback } from '@/ai/utils/generate-with-fallback';
import type { AlertBotConfig } from '@/lib/bots/types';

/**
 * Uses Gemini/Groq to convert a plain-English alert description into structured detection rules.
 * Returns sender filters and keywords the Alert Bot will scan against.
 */
export async function generateAlertRulesAction(description: string): Promise<AlertBotConfig> {
    const session = await auth();
    if (!session?.user) throw new Error('Not authenticated');

    if (!description.trim()) {
        throw new Error('Please provide a description of what to alert on.');
    }

    const prompt = `You are an email alert rule extractor. A user has described in plain English what emails they want to be alerted about.

USER DESCRIPTION:
"${description}"

Your job is to extract structured detection rules from this description. Return ONLY valid JSON, no other text.

Rules:
- senderFilters: An array of email addresses or @domain.com patterns to match against the sender. Include any email addresses or domains mentioned. If the user says "from my boss david@company.com" extract "david@company.com". If they say "anything from PayPal" extract "@paypal.com".
- keywords: An array of keywords or short phrases to look for in the email. Be smart — if the user says "emails about invoices or payments" extract ["invoice", "payment", "bill", "due", "overdue"]. Keep them concise (1-3 words each). Include synonyms.
- searchIn: Where to search. Use "subject" if the user only cares about the subject line, "body" if only body, "both" for general monitoring (default to "both" unless specified).

Return this exact JSON format:
{
  "senderFilters": ["string"],
  "keywords": ["string"],
  "searchIn": "both"
}

Examples:
- "warn me if any email from david@work.com" → {"senderFilters": ["david@work.com"], "keywords": [], "searchIn": "both"}
- "alert me about invoices and payment reminders" → {"senderFilters": [], "keywords": ["invoice", "payment", "due", "overdue", "reminder", "bill"], "searchIn": "both"}
- "emails from @paypal.com or @stripe.com or anything about refunds" → {"senderFilters": ["@paypal.com", "@stripe.com"], "keywords": ["refund", "dispute", "chargeback"], "searchIn": "both"}

Only return the JSON object. Nothing else.`;

    const { text } = await generateWithFallback({
        modelPrimary: google('gemini-1.5-flash'),
        modelFallback: groq('llama-3.3-70b-versatile'),
        prompt,
    });

    try {
        // Strip any markdown code fences if model adds them
        const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned) as {
            senderFilters: string[];
            keywords: string[];
            searchIn: 'subject' | 'body' | 'both';
        };

        return {
            userDescription: description,
            senderFilters: parsed.senderFilters || [],
            keywords: parsed.keywords || [],
            searchIn: parsed.searchIn || 'both',
            lastGeneratedAt: new Date().toISOString(),
            recentAlerts: [],
        };
    } catch {
        throw new Error('Failed to parse AI response. Please try describing your alert again.');
    }
}
