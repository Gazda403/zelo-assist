import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const InboxSummaryInputSchema = z.object({
    emails: z.array(z.object({
        id: z.string(),
        sender: z.string(),
        subject: z.string(),
        snippet: z.string(),
        urgencyScore: z.number().optional()
    })).describe("Recent emails to summarize"),
    draftsCount: z.number().describe("Number of drafts prepared by bots"),
    unreadCount: z.number().describe("Total number of unread emails"),
});

export const InboxSummaryOutputSchema = z.object({
    attentionEmails: z.array(z.object({
        id: z.string(),
        sender: z.string(),
        subject: z.string(),
        reason: z.string(),
    })).describe("Emails that need immediate attention"),
    botWork: z.array(z.string()).describe("Summary of what bots have accomplished (e.g., 'Drafted 3 replies')"),
    userActionItems: z.array(z.string()).describe("Explicit actions the user needs to take"),
    botActionItems: z.array(z.string()).describe("Items where bots need user input or approval"),
});

export const summarizeInboxFlow = ai.defineFlow(
    {
        name: 'summarizeInboxFlow',
        inputSchema: InboxSummaryInputSchema,
        outputSchema: InboxSummaryOutputSchema,
    },
    async (input) => {
        const { output } = await ai.generate({
            prompt: `(Role: Expert Executive Assistant)
            Analyze the following inbox state and generate a structured daily briefing.
            
            # Inbox State
            Unread Emails: ${input.unreadCount}
            Drafts Prepared by Bots: ${input.draftsCount}
            
            # Recent Top Emails
            ${JSON.stringify(input.emails, null, 2)}
            
            # Task
            Generate a JSON object containing:
            1. attentionEmails: 1-3 most critical emails from the list above that need immediate attention (include their exact 'id'). Keep the 'reason' concise (1 short sentence). If none are critical, return an empty array.
            2. botWork: 1-2 bullet points explaining what the AI/bots have done in the background (e.g., "Prepared ${input.draftsCount} draft responses", "Processed recent receipts").
            3. userActionItems: Specific tasks the user must do manually based on the critical emails (e.g., "Review contract from [Sender]", "Send requested available times").
            4. botActionItems: What the user needs to do to unblock the bots (e.g., "Review and approve the ${input.draftsCount > 0 ? input.draftsCount : 'pending'} AI drafts so they can be sent").

            Keep the tone professional, concise, and helpful.`,
            output: { schema: InboxSummaryOutputSchema },
        });

        if (!output) {
            throw new Error("Failed to generate inbox summary");
        }

        return output;
    }
);
