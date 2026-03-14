'use server';

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
        throw error;
    }
}
