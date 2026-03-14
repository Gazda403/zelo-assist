'use server';

import { rateEmailFlow } from '@/ai/flows/email-rater';
import { enhancedChatbotResponse } from '@/ai/flows/use-tools-to-enhance-responses';
import type { Message } from '@/lib/types';

export async function getAiResponse(prompt: string): Promise<Message> {
    try {
        const aiResponse = await enhancedChatbotResponse({ query: prompt });

        return {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: aiResponse.response,
        };
    } catch (error) {
        console.error(error);
        throw error; // Let the UI handle the error visually
    }
}

// RateEmailInput definition
interface RateEmailInput {
    subject: string;
    snippet: string;
    sender?: string;
}

export async function rateEmailAction(input: RateEmailInput) {
    try {
        const result = await rateEmailFlow(input);
        return result;
    } catch (error) {
        console.error("Error rating email:", error);
        // Return a fallback or rethrow depending on UI needs
        // For now returning null so UI can handle it
        return null;
    }
}
