import { z } from 'zod';

export const InboxSummaryInputSchema = z.object({
    emails: z.array(z.object({
        id: z.string(),
        sender: z.string(),
        subject: z.string(),
        snippet: z.string(),
        urgencyScore: z.number().optional()
    })),
    draftsCount: z.number(),
    unreadCount: z.number(),
});

export const InboxSummaryOutputSchema = z.object({
    executiveSummary: z.string(),
    attentionEmails: z.array(z.object({
        id: z.string(),
        sender: z.string(),
        subject: z.string(),
        reason: z.string(),
        recommendedAction: z.string()
    })),
    botWork: z.array(z.string()),
    userActionItems: z.array(z.string()),
    botActionItems: z.array(z.string()),
});
