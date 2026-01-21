import { GoogleGenerativeAI } from "@google/generative-ai";
import { Platform, Objective, GeneratedContentResponse } from "../types";

const responseSchema = {
  type: "object",
  properties: {
    hook: {
      type: "string",
      description: "The attention-grabbing opening line or headline.",
    },
    body: {
      type: "string",
      description: "The main content of the post. Use appropriate emojis and spacing.",
    },
    cta: {
      type: "string",
      description: "A clear Call to Action.",
    },
    tip: {
      type: "string",
      description: "A short strategic insight explaining why this structure works for the chosen objective.",
    },
  },
  required: ["hook", "body", "cta", "tip"],
};

// Initialize Gemini Client
const getAIClient = () => {
  const apiKey = (typeof process !== 'undefined' && process.env ? (process.env.API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) : null);
  
  if (!apiKey) {
    console.error("No API key found in environment variables");
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
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
  const modelName = "gemini-1.5-flash";
  
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
    const model = ai.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
        // @ts-ignore
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (text) {
      return JSON.parse(text) as GeneratedContentResponse;
    }
    
    throw new Error("No content generated");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
