import { google } from "@ai-sdk/google";
import { generateWithFallback } from "@/ai/utils/generate-with-fallback";

export async function refineDraftFlow(input: any) {
    const { draft, instruction } = input;
    try {
        const modelPrimary = google("gemini-2.0-flash");
        const modelFallback = google("gemini-1.5-flash");
        const prompt = `Refine draft: "${draft}" with instruction "${instruction}". JSON: { "refinedDraft": "...", "explanation": "..." }`;

        const { text } = await generateWithFallback({ modelPrimary, modelFallback, prompt });
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        return { refinedDraft: draft, explanation: "Updated." };
    } catch (err) { return { refinedDraft: draft, explanation: "Error." }; }
}
