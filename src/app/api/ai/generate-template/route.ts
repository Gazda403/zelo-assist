import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const { prompt, context } = await req.json();
    const { text } = await generateText({ model: google("gemini-2.0-flash"), prompt: `${context}\n\nUser Request: ${prompt}` });
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return NextResponse.json(JSON.parse(jsonMatch[0]));
}
