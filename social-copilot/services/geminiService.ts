import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Platform, Objective, GeneratedContentResponse } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    hook: {
      type: Type.STRING,
      description: "The attention-grabbing opening line or headline.",
    },
    body: {
      type: Type.STRING,
      description: "The main content of the post. Use appropriate emojis and spacing.",
    },
    cta: {
      type: Type.STRING,
      description: "A clear Call to Action.",
    },
    tip: {
      type: Type.STRING,
      description: "A short strategic insight explaining why this structure works for the chosen objective.",
    },
  },
  required: ["hook", "body", "cta", "tip"],
};

export const generatePostContent = async (
  platform: Platform,
  objective: Objective,
  topic: string
): Promise<GeneratedContentResponse> => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Act as a world-class Social Media Copywriter and Growth Expert.
    
    Create a social media post for: ${platform}
    Objective: ${objective}
    Topic: ${topic}
    
    Guidelines:
    - LinkedIn: Professional yet personal, good spacing, authoritative tone.
    - Instagram: Visual-first caption, engaging, friendly, use emojis.
    - Twitter/X: Punchy, short, thread-style if body is long.
    
    Return the result in JSON format with a Hook, Body, CTA, and a strategic Tip.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as GeneratedContentResponse;
    }
    
    throw new Error("No content generated");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
