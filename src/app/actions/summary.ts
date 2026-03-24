'use server';

import { auth } from '@/auth';
import { summarizeInboxFlow } from '@/ai/flows/inbox-summarizer';
import { InboxSummaryInputSchema } from '@/ai/flows/schema';
import { z } from 'zod';

type GenerateSummaryInput = z.infer<typeof InboxSummaryInputSchema>;

export async function generateInboxSummaryAction(input: GenerateSummaryInput) {
    const session = await auth() as any;

    if (!session || !session.accessToken) {
        throw new Error("Unauthorized");
    }

    try {
        console.log('[Generate Summary Action] Summarizing inbox state...');
        const result = await summarizeInboxFlow(input);
        return result;
    } catch (error: any) {
        console.error("Generate Summary Action Error:", error);

        // Handle Quota Exceeded errors
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes("Quota exceeded") || errorMessage.includes("429")) {
            throw new Error("AI Quota Exceeded. Please try again in ~30 seconds.");
        }

        throw new Error("Failed to generate inbox summary");
    }
}
