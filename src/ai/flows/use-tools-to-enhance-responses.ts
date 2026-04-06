'use server';
/**
 * @fileOverview Gmail-aware AI chatbot flow using real inbox data as tools.
 */

import { z } from 'zod';
import { tool } from 'ai';
import { google } from '@ai-sdk/google';
import { groq } from '@ai-sdk/groq';
import { generateWithFallback } from '@/ai/utils/generate-with-fallback';

// ─── Input / Output Schemas ───────────────────────────────────────────────────

export const EnhancedChatbotInputSchema = z.object({
    query: z.string().describe('The user query.'),
    accessToken: z.string().describe('OAuth access token for the current user.'),
    provider: z.string().optional().describe('OAuth provider (google or microsoft-entra-id)'),
});
export type EnhancedChatbotInput = z.infer<typeof EnhancedChatbotInputSchema>;

export const EnhancedChatbotOutputSchema = z.object({
    response: z.string().describe('The chatbot response.'),
});
export type EnhancedChatbotOutput = z.infer<typeof EnhancedChatbotOutputSchema>;

// ─── Client Loader ────────────────────────────────────────────────────────────

async function getClient(provider: string) {
    if (provider === 'microsoft-entra-id') {
        return await import('@/lib/outlook');
    }
    return await import('@/lib/gmail');
}

// ─── Flow ─────────────────────────────────────────────────────────────────────

export async function enhancedChatbotResponse(input: EnhancedChatbotInput): Promise<EnhancedChatbotOutput> {
    const { query, accessToken, provider = 'google' } = input;

    const modelPrimary = google("gemini-2.5-flash");
    const modelFallback = groq("llama-3.3-70b-versatile");

    const systemPrompt = `You are Zelo, an intelligent AI email assistant built into Zelo Assist. You have access to the user's real Gmail inbox via tools.

Your personality: professional, concise, and genuinely helpful. You proactively use your tools to give real answers — never say you "can't access" emails, always try the tools first.

# CRITICAL - Multilingual Rule
Detect the language the user is writing in and ALWAYS respond in that same language.
- If the user writes in Serbian (Srpski) → respond in Serbian
- If the user writes in Norwegian (Norsk) → respond in Norwegian
- If the user writes in German (Deutsch) → respond in German
- If the user writes in French, Spanish, Italian, Dutch, or any other language → respond in that language
- If the user writes in English or the language cannot be determined → respond in English
You are fluent in all languages. Never apologize for switching languages — just do it naturally.

Guidelines:
- When asked to summarize or describe recent emails, ALWAYS call getRecentEmails first.
- When asked about unread count, call getUnreadCount.
- When asked to find specific emails, use searchEmails with a relevant Gmail query.
- Format responses cleanly — use bullet points for lists of emails.
- For each email you mention, show: **Subject** from Sender — brief snippet.
- If the user asks to draft a reply or compose an email, help them write it directly without needing tools.
- Keep responses concise. Max 3-4 sentences or bullet points unless the user asks for detail.`;

    const { text } = await generateWithFallback({
        modelPrimary,
        modelFallback,
        system: systemPrompt,
        prompt: `User query: ${query}`,
        maxSteps: 5, // allows tools to be run automatically
        tools: {
            getRecentEmails: tool({
                description: 'Fetches the user\'s most recent inbox emails. Returns subject, sender, snippet, and date for the last 10 emails. Use this when the user asks to summarize, prioritize, or describe their recent emails.',
                parameters: z.object({
                    limit: z.number().optional().describe('Number of emails to fetch, default 10'),
                }),
                execute: async ({ limit }) => {
                    try {
                        const client = await getClient(provider);
                        const { emails } = await client.getLastEmails(accessToken, limit ?? 10);
                        return emails.map((e: any) => ({
                            subject: e.subject,
                            sender: e.sender?.name || e.sender?.email || 'Unknown',
                            snippet: e.snippet,
                            date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                        }));
                    } catch (err) {
                        console.error('getRecentEmails tool error:', err);
                        return [];
                    }
                }
            }),
            searchEmails: tool({
                description: 'Searches the user\'s Gmail inbox using a keyword, sender name, or subject phrase. Use this when the user asks to find specific emails (e.g., "find emails from John", "show emails about invoice").',
                parameters: z.object({
                    query: z.string().describe('Gmail search query string (e.g. "from:koyeb.com", "subject:invoice", "urgent")'),
                    limit: z.number().optional().describe('Max results to return, default 5'),
                }),
                execute: async ({ query, limit }) => {
                    try {
                        const client = await getClient(provider);
                        const emails = await client.searchEmails(accessToken, query, limit ?? 5);
                        return emails.map((e: any) => ({
                            subject: e.subject,
                            sender: e.sender?.name || e.sender?.email || 'Unknown',
                            snippet: e.snippet,
                            date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                        }));
                    } catch (err) {
                        console.error('searchEmails tool error:', err);
                        return [];
                    }
                }
            }),
            getUnreadCount: tool({
                description: 'Returns the number of unread emails in the user\'s inbox. Use this when the user asks how many unread emails they have.',
                parameters: z.object({}),
                execute: async () => {
                    try {
                        const client = await getClient(provider);
                        const count = await client.getUnreadCount(accessToken);
                        return { unreadCount: count };
                    } catch (err) {
                        console.error('getUnreadCount tool error:', err);
                        return { unreadCount: 0 };
                    }
                }
            })
        }
    });

    return { response: text };
}
