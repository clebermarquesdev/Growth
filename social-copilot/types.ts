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

export type CreatorPositioning = 'educator' | 'authority' | 'inspirational' | 'seller';
export type AudienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type OfferType = 'product' | 'service' | 'free_content' | 'none';
export type ContentFocus = 'authority' | 'relationship' | 'sales';
export type ToneOfVoice = 'professional' | 'casual' | 'provocative' | 'educational';
export type ContentLength = 'short' | 'medium' | 'long';
export type ContentGoal = 'grow_audience' | 'generate_leads' | 'sell';
export type PostFrequency = 'daily' | 'few_times_week' | 'weekly' | 'sporadic';

export interface CreatorAudience {
  profile: string;
  level: AudienceLevel;
  mainPain: string;
  mainDesire: string;
}

export interface CreatorOffer {
  type: OfferType;
  mainBenefit: string;
  contentFocus: ContentFocus;
}

export interface CreatorProfile {
  role: string;
  experienceYears: string;
  positioning: CreatorPositioning;
  audience: CreatorAudience;
  offer: CreatorOffer;
  toneOfVoice: ToneOfVoice;
  contentLength: ContentLength;
  styleReference?: string;
  primaryGoal: ContentGoal;
  mainChannels: Platform[];
  postFrequency: PostFrequency;
  completedAt?: number;
}
