import { google } from "@ai-sdk/google";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // Transform messages from @ai-sdk/react format (with parts array) to AI SDK format
        const formattedMessages = messages.map((m: any) => {
            // Extract text from parts array
            let content = '';
            if (m.parts && Array.isArray(m.parts)) {
                // Find text parts and concatenate them
                content = m.parts
                    .filter((part: any) => part.type === 'text')
                    .map((part: any) => part.text)
                    .join('');
            }

            return {
                role: m.role,
                content: content
            };
        });

        const result = streamText({
            model: google("gemini-1.5-flash"),
            messages: formattedMessages,
            system: "You are an AI email assistant known as 'Gmail Secretary'. Your goal is to help the user manage their inbox, draft replies, and prioritize emails. Be professional, concise, and helpful. You have access to the user's email context only if explicitly provided in the message. If asked about specific emails that you don't have context for, ask for the email content.",
        });

        return result.toTextStreamResponse();
    } catch (e) {
        console.error("Chat API Error:", e);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
