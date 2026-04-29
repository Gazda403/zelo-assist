import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { generateWithFallback } from "@/ai/utils/generate-with-fallback";

export interface ChatbotInput {
    query: string;
    history?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface ChatbotOutput {
    response: string;
}

/**
 * Chatbot flow using Vercel AI SDK.
 * Tries Gemini first and falls back to Groq if Gemini hits rate limits.
 */
export async function chatbotFlow(input: ChatbotInput): Promise<ChatbotOutput> {
    const { query, history } = input;

    const modelPrimary = google("gemini-1.5-flash");
    const modelFallback = groq("llama-3.3-70b-versatile");

    // Build conversation as a prompt string (history + current query)
    const historyText = history && history.length > 0
        ? history.map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n") + "\n"
        : "";

    const prompt = `You are Gmail Secretary, a helpful AI assistant integrated into a Gmail-like email app.
You help users understand their emails, draft responses, and manage their inbox.
Be concise, professional, and helpful.

${historyText ? `Previous conversation:\n${historyText}\n` : ""}User: ${query}
Assistant:`;

    try {
        const { text } = await generateWithFallback({
            modelPrimary,
            modelFallback,
            prompt,
        });

        return { response: text.trim() };
    } catch (error) {
        console.error("[Chatbot] Both primary and fallback models failed:", error);
        return {
            response: "I'm sorry, I'm having trouble connecting to the AI service right now. Please try again in a moment.",
        };
    }
}
