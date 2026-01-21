export enum Platform {
  LINKEDIN = 'LinkedIn',
  INSTAGRAM = 'Instagram',
  TWITTER = 'Twitter/X',
  TIKTOK = 'TikTok',
  FACEBOOK = 'Facebook',
  THREADS = 'Threads'
}

export enum Objective {
  ENGAGEMENT = 'Engajamento',
  AUTHORITY = 'Autoridade',
  SALES = 'Vendas/Leads',
  EDUCATIONAL = 'Educativo',
  STORYTELLING = 'Storytelling',
  HUMOR = 'Humor/Descontraído'
}

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  platforms: Platform[];
  promptHint: string;
}

export enum PostStatus {
  DRAFT = 'Rascunho',
  SCHEDULED = 'Agendado',
  PUBLISHED = 'Publicado'
}

export interface PostContent {
  hook: string;
  body: string;
  cta: string;
  tip?: string; // Insight on why this content works
}

export interface PostMetrics {
  likes: number;
  comments: number;
  shares?: number;
  impressions?: number;
}

export interface Post {
  id: string;
  platform: Platform;
  objective: Objective;
  topic: string;
  content: PostContent;
  status: PostStatus;
  scheduledDate: string; // ISO Date string
  metrics?: PostMetrics;
  createdAt: number;
}

export type ViewState = 'dashboard' | 'generator' | 'calendar' | 'analytics';

export interface GeneratedContentResponse {
  hook: string;
  body: string;
  cta: string;
  tip: string;
  hashtags?: string[];
}
