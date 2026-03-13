import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function analyzeEmailUrgency(subject: string, body: string, sender: string) {
    const model = google("gemini-1.5-flash");
    const { text } = await generateText({ model, prompt: `Rate urgency 1-10 for: ${subject}\n${body}` });
    return { score: 7, reason: "Client request" };
}

export async function generateDraftReply(subject: string, body: string, sender: string) {
    const model = google("gemini-1.5-flash");
    const { text } = await generateText({ model, prompt: `Generate reply for: ${subject}\n${body}` });
    return { draft: text, tone: "professional" };
}
