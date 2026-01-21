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
    hashtags: {
      type: "array",
      items: { type: "string" },
      description: "5-8 relevant hashtags for the post, without the # symbol.",
    },
  },
  required: ["hook", "body", "cta", "tip", "hashtags"],
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
    
    Diretrizes por plataforma:
    - LinkedIn: Profissional, mas pessoal, bom espaçamento, tom de autoridade. Limite: 3000 caracteres.
    - Instagram: Legenda focada no visual, engajadora, amigável, use emojis. Limite: 2200 caracteres.
    - Twitter/X: Direto, curto, estilo thread se o corpo for longo. Limite: 280 caracteres por tweet.
    - TikTok: Casual, divertido, use gírias e emojis, chame atenção rápido. Limite: 2200 caracteres.
    - Facebook: Tom conversacional, conte histórias, pergunte opiniões. Limite: 500 caracteres ideal.
    - Threads: Similar ao Twitter, mas mais conversacional. Limite: 500 caracteres.
    
    Diretrizes por objetivo:
    - Engajamento: Faça perguntas, peça opiniões, crie debates.
    - Autoridade: Compartilhe dados, estatísticas, expertise.
    - Vendas/Leads: Destaque benefícios, urgência, oferta clara.
    - Educativo: Ensine algo valioso, passo a passo, dicas práticas.
    - Storytelling: Conte uma história pessoal ou case de sucesso.
    - Humor/Descontraído: Tom leve, memes, situações engraçadas.
    
    Retorne o resultado estritamente em formato JSON com os campos: hook, body, cta, tip, e hashtags (array com 5-8 hashtags relevantes sem o símbolo #).
    Não inclua explicações, apenas o JSON.
    A resposta deve ser em Português (Brasil).
  `;

  try {
    const model = ai.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema as any,
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (text) {
      const parsed = JSON.parse(text) as GeneratedContentResponse;
      if (!parsed.hashtags || !Array.isArray(parsed.hashtags)) {
        parsed.hashtags = [];
      }
      return parsed;
    }
    
    throw new Error("No content generated");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
