import { ai } from '@/ai/genkit';
import { InboxSummaryInputSchema, InboxSummaryOutputSchema } from './schema';
import { z } from 'genkit';

// Output schema remains here or we just use the imported one.
// We'll keep the Genkit-specific descriptions for the AI.
const InternalOutputSchema = z.object({
    executiveSummary: z.string().describe("A rich, 2-3 paragraph executive summary of the overall inbox state, highlighting key themes, urgent matters, and what the user should focus on today."),
    attentionEmails: z.array(z.object({
        id: z.string(),
        sender: z.string(),
        subject: z.string(),
        reason: z.string(),
        recommendedAction: z.string().describe("Specific next step for this email")
    })).describe("Emails that need immediate attention"),
    botWork: z.array(z.string()).describe("Detailed bullet points of what bots have accomplished (e.g., 'Drafted 3 replies')"),
    userActionItems: z.array(z.string()).describe("Explicit, detailed actions the user needs to take"),
    botActionItems: z.array(z.string()).describe("Items where bots need user input or approval"),
});

export const summarizeInboxFlow = ai.defineFlow(
    {
        name: 'summarizeInboxFlow',
        inputSchema: InboxSummaryInputSchema,
        outputSchema: InternalOutputSchema,
    },
    async (input) => {
        const { output } = await ai.generate({
            prompt: `(Role: Expert Executive Assistant)
            Analyze the following inbox state and generate a structured, comprehensive daily briefing.
            
            # Inbox State
            Unread Emails: ${input.unreadCount}
            Drafts Prepared by Bots: ${input.draftsCount}
            
            # Recent Top Emails
            ${JSON.stringify(input.emails, null, 2)}
            
            # Task
            Generate a JSON object containing:
            1. executiveSummary: A rich, 2-3 paragraph overview of the inbox. Highlight key themes, urgent matters, and provide strategic context on what the user should prioritize today.
            2. attentionEmails: 1-3 most critical emails from the list above that need immediate attention (include their exact 'id'). Provide a detailed 'reason' why it's critical, and a specific 'recommendedAction'. If none are critical, return an empty array.
            3. botWork: 1-2 detailed bullet points explaining what the AI/bots have done in the background.
            4. userActionItems: Specific, descriptive tasks the user must do manually based on the critical emails.
            5. botActionItems: What the user needs to do to unblock the bots (e.g., "Review and approve the ${input.draftsCount > 0 ? input.draftsCount : 'pending'} AI drafts so they can be sent").

            Keep the tone professional, highly insightful, and strategically helpful.`,
            output: { schema: InternalOutputSchema },
        });

        if (!output) {
            throw new Error("Failed to generate inbox summary");
        }

        return output;
    }
);
