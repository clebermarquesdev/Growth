export enum Platform {
  LINKEDIN = 'LinkedIn',
  INSTAGRAM = 'Instagram',
  TWITTER = 'Twitter/X'
}

export enum Objective {
  ENGAGEMENT = 'Engagement',
  AUTHORITY = 'Authority',
  SALES = 'Sales/Leads'
}

export enum PostStatus {
  DRAFT = 'Draft',
  SCHEDULED = 'Scheduled',
  PUBLISHED = 'Published'
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
}
