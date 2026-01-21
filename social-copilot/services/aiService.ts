import OpenAI from "openai";
import { Platform, Objective, GeneratedContentResponse, CreatorProfile } from "../types";

const getOpenRouterClient = () => {
  // @ts-ignore
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || (typeof process !== 'undefined' && process.env.VITE_OPENROUTER_API_KEY);
  
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

const buildProfileContext = (profile: CreatorProfile): string => {
  const positioningLabels: Record<string, string> = {
    educator: 'Educador que ensina e compartilha conhecimento',
    authority: 'Autoridade e referência na área',
    inspirational: 'Inspirador que motiva e transforma pessoas',
    seller: 'Vendedor focado em conversão'
  };

  const toneLabels: Record<string, string> = {
    professional: 'profissional e formal',
    casual: 'casual e descontraído',
    provocative: 'provocativo que desafia o status quo',
    educational: 'didático que explica com clareza'
  };

  const lengthLabels: Record<string, string> = {
    short: 'curtos e diretos',
    medium: 'de tamanho médio e equilibrados',
    long: 'longos e mais profundos'
  };

  const audienceLevelLabels: Record<string, string> = {
    beginner: 'iniciante',
    intermediate: 'intermediário',
    advanced: 'avançado'
  };

  const goalLabels: Record<string, string> = {
    grow_audience: 'crescer audiência e ganhar seguidores',
    generate_leads: 'gerar leads e captar contatos',
    sell: 'converter seguidores em vendas'
  };

  return `
PERFIL DO CRIADOR (use essas informações para personalizar o conteúdo):
- Profissão/Área: ${profile.role}
- Experiência: ${profile.experienceYears}
- Posicionamento: ${positioningLabels[profile.positioning] || profile.positioning}
- Público-alvo: ${profile.audience.profile}
- Nível do público: ${audienceLevelLabels[profile.audience.level] || profile.audience.level}
- Principal dor do público: ${profile.audience.mainPain}
- Principal desejo do público: ${profile.audience.mainDesire}
${profile.offer.type !== 'none' ? `- Oferta: ${profile.offer.mainBenefit}` : ''}
- Tom de voz: ${toneLabels[profile.toneOfVoice] || profile.toneOfVoice}
- Preferência de posts: ${lengthLabels[profile.contentLength] || profile.contentLength}
${profile.styleReference ? `- Referência de estilo: ${profile.styleReference}` : ''}
- Objetivo principal: ${goalLabels[profile.primaryGoal] || profile.primaryGoal}

IMPORTANTE: O conteúdo DEVE refletir o perfil acima. Use linguagem adequada ao público, aborde as dores e desejos mencionados, e mantenha o tom de voz especificado.
`;
};

export const generatePostContent = async (
  platform: Platform,
  objective: Objective,
  topic: string,
  creatorProfile?: CreatorProfile
): Promise<GeneratedContentResponse> => {
  const openai = getOpenRouterClient();
  if (!openai) {
    throw new Error("Configuração Necessária: Por favor, adicione sua OPENROUTER_API_KEY nos Secrets do Replit.");
  }

  const profileContext = creatorProfile ? buildProfileContext(creatorProfile) : '';

  const prompt = `
    Atue como um Copywriter de Redes Sociais e Especialista em Crescimento de classe mundial.
    
    ${profileContext}
    
    Crie um post para rede social para: ${platform}
    Objetivo do post: ${objective}
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
    Não inclua explicações, apenas o JSON puro.
    A resposta deve ser em Português (Brasil).
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-exp:free",
      messages: [
        {
          role: "system",
          content: "Você é um assistente que gera posts para redes sociais em formato JSON. Responda APENAS o JSON puro, sem explicações ou blocos de código markdown. Siga EXATAMENTE a estrutura: {\"hook\": \"...\", \"body\": \"...\", \"cta\": \"...\", \"tip\": \"...\", \"hashtags\": [\"...\"]}"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      extra_body: {
        "provider": {
          "order": ["Google", "Mistral", "Meta", "Anthropic"],
          "allow_fallbacks": true,
          "require_parameters": false
        }
      }
    } as any);

    const text = response.choices[0].message.content;

    if (text) {
      const cleanText = text.replace(/```json\n?|```/g, '').trim();
      const parsed = JSON.parse(cleanText) as GeneratedContentResponse;
      if (!parsed.hashtags || !Array.isArray(parsed.hashtags)) {
        parsed.hashtags = [];
      }
      return parsed;
    }
    
    throw new Error("Não foi possível gerar conteúdo.");
  } catch (error) {
    console.error("OpenRouter Error:", error);
    throw error;
  }
};
