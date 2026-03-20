import { GoogleGenAI } from "@google/genai";
import { Tone } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateEmailReply = async (incomingEmail: string, tone: Tone): Promise<string> => {
  try {
    const prompt = `
      You are an expert email assistant. 
      Incoming Email:
      "${incomingEmail}"
      
      Task: Write a reply to this email.
      Tone: ${tone}.
      Length: Keep it under 150 words.
      Format: Plain text, no subject line needed.
      
      Do not include placeholders like [Your Name], just end with "Best regards,".
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }, // Disable thinking for speed
        temperature: 0.7,
      }
    });

    return response.text || "I couldn't generate a reply at this moment. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred while communicating with the AI. Please check your connection.";
  }
};