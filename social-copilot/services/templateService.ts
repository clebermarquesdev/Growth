import { getAuthToken } from "./authService";

export interface SavedTemplate {
  id: string;
  name: string;
  platform: string;
  objective: string;
  topic: string;
  content: {
    hook: string;
    body: string;
    cta: string;
    tip: string;
    hashtags: string[];
  };
  createdAt: number;
}

export const getTemplates = async (): Promise<SavedTemplate[]> => {
  const token = getAuthToken();
  const response = await fetch('/api/templates', {
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Erro ao buscar templates');
  }
  
  return response.json();
};

export const saveTemplate = async (template: Omit<SavedTemplate, 'id' | 'createdAt'>): Promise<SavedTemplate> => {
  const token = getAuthToken();
  const response = await fetch('/api/templates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    credentials: 'include',
    body: JSON.stringify(template)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao salvar template');
  }
  
  return response.json();
};

export const deleteTemplate = async (id: string): Promise<void> => {
  const token = getAuthToken();
  const response = await fetch(`/api/templates/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Erro ao excluir template');
  }
};
