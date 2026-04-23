'use server';

import { rateEmailFlow } from '@/ai/flows/email-rater';
import { enhancedChatbotResponse } from '@/ai/flows/use-tools-to-enhance-responses';
import type { Message } from '@/lib/types';
import { auth } from '@/auth';



export async function getAiResponse(prompt: string): Promise<Message> {
    console.log("[Chatbot] getAiResponse called with prompt:", prompt);
    try {
        const session = await auth();
        const accessToken = (session as any)?.accessToken as string | undefined;

        if (!accessToken) {
            console.warn("[Chatbot] No access token found in session");
            return {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: "I can't access your emails right now — it looks like your session has expired. Please sign out and sign back in.",
            };
        }
        const provider = (session as any)?.provider as string | undefined;
        console.log("[Chatbot] Provider:", provider, "Token length:", accessToken?.length);

        console.log("[Chatbot] Calling enhancedChatbotResponse...");
        const aiResponse = await enhancedChatbotResponse({ query: prompt, accessToken, provider });
        console.log("[Chatbot] AI Response received:", aiResponse.response.slice(0, 50), "...");

        return {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: aiResponse.response,
        };
    } catch (error) {
        console.error("[Chatbot] Error in getAiResponse:", error);
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
        return null;
    }
}
