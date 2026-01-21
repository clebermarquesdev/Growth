import OpenAI from "openai";
import { Platform, Objective, GeneratedContentResponse } from "../types";

// Initialize OpenRouter Client (OpenAI compatible)
const getOpenRouterClient = () => {
  // @ts-ignore
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  
  if (!apiKey) {
    console.error("OpenRouter API key not found");
    return null;
  }

  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
    dangerouslyAllowBrowser: true,
    defaultHeaders: {
      "HTTP-Referer": window.location.origin,
      "X-Title": "Social Copilot",
    }
  });
};

export const generatePostContent = async (
  platform: Platform,
  objective: Objective,
  topic: string
): Promise<GeneratedContentResponse> => {
  const openai = getOpenRouterClient();
  if (!openai) {
    throw new Error("Configuração Necessária: Por favor, adicione sua OPENROUTER_API_KEY nos Secrets do Replit.");
  }

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
    Não inclua explicações, apenas o JSON puro.
    A resposta deve ser em Português (Brasil).
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-exp:free",
      messages: [
        {
          role: "system",
          content: "Você é um assistente que gera posts para redes sociais em formato JSON. Responda APENAS o JSON puro, sem explicações ou blocos de código markdown. Siga EXATAMENTE a estrutura: {\"hook\": \"...\", \"body\": \"...\", \"cta\": \"...\", \"tip\": \"...\"}"
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const text = response.choices[0].message.content;

    if (text) {
      // Basic cleaning in case the model returns markdown code blocks
      const cleanText = text.replace(/```json\n?|```/g, '').trim();
      return JSON.parse(cleanText) as GeneratedContentResponse;
    }
    
    throw new Error("Não foi possível gerar conteúdo.");
  } catch (error) {
    console.error("OpenRouter Error:", error);
    throw error;
  }
};
