import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Platform, Objective, GeneratedContentResponse } from "../types";

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

// Initialize Gemini Client
const getAIClient = () => {
  // Try to get key from process.env (Vite define) or from a direct check if available
  const apiKey = (typeof process !== 'undefined' && process.env ? (process.env.API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) : null);
  
  if (!apiKey) {
    console.error("No API key found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generatePostContent = async (
  platform: Platform,
  objective: Objective,
  topic: string
): Promise<GeneratedContentResponse> => {
  const ai = getAIClient();
  if (!ai) {
    throw new Error("Configuração Necessária: Por favor, adicione sua GEMINI_API_KEY nos Secrets do Replit para começar.");
  }
  const model = "gemini-1.5-flash";
  
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
    The response must be in Portuguese (Brazil) as the primary audience is Brazilian.
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
