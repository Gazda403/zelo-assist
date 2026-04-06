'use server';
/**
 * @fileOverview Gmail-aware AI chatbot flow using real inbox data as tools.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getLastEmails, searchEmails as gmailSearch, getUnreadCount } from '@/lib/gmail';

// ─── Input / Output Schemas ───────────────────────────────────────────────────

const EnhancedChatbotInputSchema = z.object({
    query: z.string().describe('The user query.'),
    accessToken: z.string().describe('OAuth access token for the current user.'),
    provider: z.string().optional().describe('OAuth provider (google or microsoft-entra-id)'),
});
export type EnhancedChatbotInput = z.infer<typeof EnhancedChatbotInputSchema>;

const EnhancedChatbotOutputSchema = z.object({
    response: z.string().describe('The chatbot response.'),
});
export type EnhancedChatbotOutput = z.infer<typeof EnhancedChatbotOutputSchema>;

// ─── Tools ───────────────────────────────────────────────────────────────────

// We store the access token and provider in a closure so tools can use it
let _accessToken = '';
let _provider = '';

async function getClient() {
    if (_provider === 'microsoft-entra-id') {
        return await import('@/lib/outlook');
    }
    return await import('@/lib/gmail');
}

const getRecentEmailsTool = ai.defineTool(
    {
        name: 'getRecentEmails',
        description: 'Fetches the user\'s most recent inbox emails. Returns subject, sender, snippet, and date for the last 10 emails. Use this when the user asks to summarize, prioritize, or describe their recent emails.',
        inputSchema: z.object({
            limit: z.number().optional().describe('Number of emails to fetch, default 10'),
        }),
        outputSchema: z.array(z.object({
            subject: z.string(),
            sender: z.string(),
            snippet: z.string(),
            date: z.string(),
        })),
    },
    async (input) => {
        try {
            const client = await getClient();
            const { emails } = await client.getLastEmails(_accessToken, input.limit ?? 10);
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
);

const searchEmailsTool = ai.defineTool(
    {
        name: 'searchEmails',
        description: 'Searches the user\'s Gmail inbox using a keyword, sender name, or subject phrase. Use this when the user asks to find specific emails (e.g., "find emails from John", "show emails about invoice").',
        inputSchema: z.object({
            query: z.string().describe('Gmail search query string (e.g. "from:koyeb.com", "subject:invoice", "urgent")'),
            limit: z.number().optional().describe('Max results to return, default 5'),
        }),
        outputSchema: z.array(z.object({
            subject: z.string(),
            sender: z.string(),
            snippet: z.string(),
            date: z.string(),
        })),
    },
    async (input) => {
        try {
            const client = await getClient();
            const emails = await client.searchEmails(_accessToken, input.query, input.limit ?? 5);
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
);

const getUnreadCountTool = ai.defineTool(
    {
        name: 'getUnreadCount',
        description: 'Returns the number of unread emails in the user\'s inbox. Use this when the user asks how many unread emails they have.',
        inputSchema: z.object({}),
        outputSchema: z.object({
            unreadCount: z.number(),
        }),
    },
    async () => {
        try {
            const client = await getClient();
            const count = await client.getUnreadCount(_accessToken);
            return { unreadCount: count };
        } catch (err) {
            console.error('getUnreadCount tool error:', err);
            return { unreadCount: 0 };
        }
    }
);

// ─── Prompt ──────────────────────────────────────────────────────────────────

const prompt = ai.definePrompt({
    name: 'enhancedChatbotPrompt',
    input: { schema: EnhancedChatbotInputSchema },
    output: { schema: EnhancedChatbotOutputSchema },
    tools: [getRecentEmailsTool, searchEmailsTool, getUnreadCountTool],
    prompt: `You are Zelo, an intelligent AI email assistant built into Zelo Assist. You have access to the user's real Gmail inbox via tools.

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
- Keep responses concise. Max 3-4 sentences or bullet points unless the user asks for detail.

User query: {{query}}`,
});

// ─── Flow ─────────────────────────────────────────────────────────────────────

const enhancedChatbotResponseFlow = ai.defineFlow(
    {
        name: 'enhancedChatbotResponseFlow',
        inputSchema: EnhancedChatbotInputSchema,
        outputSchema: EnhancedChatbotOutputSchema,
    },
    async (input) => {
        // Set token and provider for tool closures
        _accessToken = input.accessToken;
        _provider = input.provider || 'google';
        const { output } = await prompt(input);
        return output!;
    }
);

export async function enhancedChatbotResponse(input: EnhancedChatbotInput): Promise<EnhancedChatbotOutput> {
    return enhancedChatbotResponseFlow(input);
}
