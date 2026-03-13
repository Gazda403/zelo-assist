import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateText } from "ai";

export async function generateWithFallback({ modelPrimary, modelFallback, prompt }: { modelPrimary: any, modelFallback: any, prompt: string }) {
    try {
        console.log('[AI Utils] Attempting generation with primary model...');
        return await generateText({
            model: modelPrimary,
            prompt: prompt,
        });
    } catch (error) {
        console.warn('[AI Utils] Primary model failed, falling back...', error);
        return await generateText({
            model: modelFallback,
            prompt: prompt,
        });
    }
}
