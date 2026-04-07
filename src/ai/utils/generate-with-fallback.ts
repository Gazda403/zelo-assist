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
 * Extracts a JSON object or array from a string that may contain extra text.
 * Tries JSON.parse first, then uses regex to find embedded JSON.
 */
function extractJson(text: string): any {
    // First strip common markdown fences
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    // Try direct parse first
    try {
        return JSON.parse(cleaned);
    } catch {
        // Fall through to regex extraction
    }

    // Use regex to find the first { ... } block in the response
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
        try {
            return JSON.parse(match[0]);
        } catch (e) {
            throw new Error(`Groq returned text but JSON was unparseable. Raw: "${cleaned.slice(0, 300)}"`);
        }
    }

    throw new Error(`Groq returned no JSON object. Raw response: "${cleaned.slice(0, 300)}"`);
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
        console.warn(`[AI Fallback] Gemini failed (${primaryError?.status ?? 'unknown status'}): "${primaryMsg}". Switching to Groq...`);

        try {
            const fallbackPrompt = `${prompt}\n\nIMPORTANT: YOU MUST RETURN ONLY RAW, VALID JSON MATCHING THE REQUESTED STRUCTURE. NO MARKDOWN FENCES, NO COMMENTS, NO EXTRA TEXT BEFORE OR AFTER THE JSON OBJECT.`;

            const result = await generateText({
                model: modelFallback,
                prompt: fallbackPrompt,
                ...generateOptions,
            } as any);

            console.log(`[AI Fallback] Groq raw response: "${result.text.slice(0, 200)}"`);

            const object = extractJson(result.text);

            console.log(`[AI Fallback] Groq responded successfully. Parsed object:`, object);
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
