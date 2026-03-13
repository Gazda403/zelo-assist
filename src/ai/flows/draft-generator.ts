import { google } from "@ai-sdk/google";
import { generateWithFallback } from "@/ai/utils/generate-with-fallback";

export async function generateDraftFlow(input: any) {
    const { sender, senderEmail, subject, emailBody, knowledgeBase } = input;
    try {
        const modelPrimary = google("gemini-2.0-flash");
        const modelFallback = google("gemini-1.5-flash");
        const prompt = `Draft a reply to: \nFrom: ${sender}\nSub: ${subject}\nBody: ${emailBody}\nKB: ${knowledgeBase}\nJSON: { "draft": "...", "tone": "..." }`;

        const { text } = await generateWithFallback({ modelPrimary, modelFallback, prompt });
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        return { draft: "Reviewing...", tone: "professional" };
    } catch (err) { return { draft: "Refining...", tone: "professional" }; }
}
