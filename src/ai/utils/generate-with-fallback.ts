import { generateText, generateObject } from "ai";

interface GenerateWithFallbackOptions {
    modelPrimary: any;
    modelFallback: any;
    [key: string]: any;
}

/**
 * Attempts to generate text using a primary model (Gemini).
 * If Gemini fails for ANY reason, automatically falls back to Groq.
 * Only throws if both models fail.
 */
export async function generateWithFallback(options: GenerateWithFallbackOptions): Promise<any> {
    const { modelPrimary, modelFallback, ...generateOptions } = options;

    try {
        const result = await generateText({
            model: modelPrimary,
            ...generateOptions,
        } as any);
        return result;
    } catch (primaryError: any) {
        const primaryMsg = primaryError?.message ?? String(primaryError);
        console.warn(`[AI Fallback] Gemini failed: "${primaryMsg}". Switching to Groq...`);

        try {
            const result = await generateText({
                model: modelFallback,
                ...generateOptions,
            } as any);
            console.log(`[AI Fallback] Groq responded successfully.`);
            return result;
        } catch (fallbackError: any) {
            const fallbackMsg = fallbackError?.message ?? String(fallbackError);
            console.error(`[AI Fallback] Groq also failed: "${fallbackMsg}"`);
            // Throw original error for context
            throw new Error(
                `Both AI models failed.\nGemini: ${primaryMsg}\nGroq: ${fallbackMsg}`
            );
        }
    }
}

/**
 * Attempts to generate a structured object using a primary model (Gemini).
 * If Gemini fails for ANY reason, automatically falls back to Groq.
 * Only throws if both models fail.
 */
export async function generateObjectWithFallback<T>(options: GenerateWithFallbackOptions & { schema?: any }) {
    const { modelPrimary, modelFallback, schema, prompt, ...generateOptions } = options;

    try {
        const result = await generateObject({
            model: modelPrimary,
            schema,
            prompt,
            ...generateOptions,
        } as any);
        return result;
    } catch (primaryError: any) {
        const primaryMsg = primaryError?.message ?? String(primaryError);
        console.warn(`[AI Fallback] Gemini failed: "${primaryMsg}". Switching to Groq...`);

        try {
            const fallbackPrompt = `${prompt}\n\nIMPORTANT: YOU MUST RETURN ONLY RAW, VALID JSON MATCHING THE REQUESTED STRUCTURE. NO MARKDOWN FENCES, NO COMMENTS, NO EXTRA TEXT.`;
            
            const result = await generateText({
                model: modelFallback,
                prompt: fallbackPrompt,
                ...generateOptions,
            } as any);
            
            let text = result.text.trim();
            if (text.startsWith('```json')) text = text.slice(7);
            if (text.startsWith('```')) text = text.slice(3);
            if (text.endsWith('```')) text = text.slice(0, -3);
            text = text.trim();

            const object = JSON.parse(text);

            console.log(`[AI Fallback] Groq responded successfully.`);
            return { object } as any;
        } catch (fallbackError: any) {
            const fallbackMsg = fallbackError?.message ?? String(fallbackError);
            console.error(`[AI Fallback] Groq also failed: "${fallbackMsg}"`);
            throw new Error(
                `Both AI models failed.\nGemini: ${primaryMsg}\nGroq: ${fallbackMsg}`
            );
        }
    }
}
