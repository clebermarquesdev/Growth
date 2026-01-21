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
  // @ts-ignore
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || (typeof process !== 'undefined' && process.env.VITE_GOOGLE_API_KEY);
  
  if (!apiKey) {
    console.error("Chave de API não encontrada em VITE_GOOGLE_API_KEY");
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
    throw new Error("Configuração Necessária: Por favor, adicione sua GOOGLE_API_KEY nos Secrets do Replit para começar.");
  }
  const modelName = "gemini-1.5-flash";
  
  const prompt = `
    Atue como um Copywriter de Redes Sociais e Especialista em Crescimento de classe mundial.
    
    Crie um post para rede social para: ${platform}
    Objetivo: ${objective}
    Tópico: ${topic}
    
    Diretrizes:
    - LinkedIn: Profissional, mas pessoal, bom espaçamento, tom de autoridade.
    - Instagram: Legenda focada no visual, engajadora, amigável, use emojis.
    - Twitter/X: Direto, curto, estilo thread se o corpo for longo.
    
    Retorne o resultado estritamente em formato JSON com os campos: hook, body, cta, e tip.
    Não inclua explicações, apenas o JSON.
    A resposta deve ser em Português (Brasil).
  `;

  try {
    const model = ai.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
      }
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
