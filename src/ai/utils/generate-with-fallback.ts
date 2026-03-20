import { generateText, LanguageModel } from "ai";

interface GenerateWithFallbackOptions {
    modelPrimary: LanguageModel;
    modelFallback: LanguageModel;
    [key: string]: any; // Allow any other properties supported by generateText
}

/**
 * Attempts to generate text using a primary model.
 * If a quota limit (429 or 'quota exceeded') is hit, it falls back to a secondary model.
 */
export async function generateWithFallback(options: GenerateWithFallbackOptions) {
    const { modelPrimary, modelFallback, ...generateOptions } = options;

    try {
        // Try primary model
        return await generateText({
            model: modelPrimary,
            ...generateOptions,
        } as any);
    } catch (error: any) {
        // Check for specific quota/rate limit errors
        const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
        const isQuotaError =
            errorMessage.includes("quota exceeded") ||
            errorMessage.includes("429") ||
            errorMessage.includes("resource has been exhausted");

        if (isQuotaError) {
            console.warn(`[AI Fallback] Primary model failed with quota error. Switching to fallback model...`);
            console.warn(`[AI Fallback] Error details: ${errorMessage}`);

            // Try fallback model
            try {
                return await generateText({
                    model: modelFallback,
                    ...generateOptions,
                } as any);
            } catch (fallbackError) {
                console.error(`[AI Fallback] Fallback model also failed:`, fallbackError);
                // Throw the original error to keep the context that the primary failed + fallback failed
                throw error;
            }
        }

        // If it's not a quota error (e.g. invalid prompt, server error), rethrow immediately
        throw error;
    }
}


