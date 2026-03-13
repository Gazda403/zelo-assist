import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const model = google('models/gemini-1.5-pro-latest');

export async function generateFollowUpContent(subject: string, snippet: string, recipient: string, fallback: string) {
    try {
        const { text } = await generateText({
            model: model,
            prompt: `
        Generate a polite, professional, and short follow-up email.
        Context:
        - Subject: ${subject}
        - Last message snippet: ${snippet}
        - Recipient: ${recipient}
        
        Rules:
        1. Keep it under 3 sentences.
        2. Don't be pushy.
        3. Aim to be helpful.
        4. Focus on checking if they have any questions or if the previous info was received.
      `,
        });
        return text || fallback;
    } catch (error) {
        console.error("AI Generation Error:", error);
        return fallback;
    }
}
