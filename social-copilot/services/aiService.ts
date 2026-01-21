import { Platform, Objective, GeneratedContentResponse, CreatorProfile } from "../types";
import { getAuthToken } from "./authService";

export const generatePostContent = async (
  platform: Platform,
  objective: Objective,
  topic: string,
  creatorProfile?: CreatorProfile
): Promise<GeneratedContentResponse> => {
  const token = getAuthToken();
  
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    credentials: 'include',
    body: JSON.stringify({
      platform,
      objective,
      topic,
      creatorProfile
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao gerar conteúdo');
  }
  
  const data = await response.json();
  
  if (!data.hashtags || !Array.isArray(data.hashtags)) {
    data.hashtags = [];
  }
  
  return data as GeneratedContentResponse;
};
