import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { prompt, context } = await req.json();

        const model = google("gemini-1.5-flash");

        const { text } = await generateText({
            model,
            prompt: `${context}

User Request: ${prompt}

Generate a professional acknowledgment email template. Return ONLY a JSON object with this exact structure:
{
  "subject": "the subject line (can include variables like {{subject}})",
  "body": "the email body (can include variables like {{sender_name}}, {{response_time}}, etc.)"
}

Make sure to use appropriate variables for personalization.`,
        });

        // Parse the AI response as JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid AI response format');
        }

        const generated = JSON.parse(jsonMatch[0]);

        return NextResponse.json(generated);
    } catch (error) {
        console.error('Template generation failed:', error);
        return NextResponse.json(
            { error: 'Failed to generate template' },
            { status: 500 }
        );
    }
}
