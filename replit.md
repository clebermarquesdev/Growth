# Social Copilot

## Overview
A React-based social media content assistant powered by Google Gemini AI. The application helps users with social media content creation and management.

## Tech Stack
- React 19
- TypeScript
- Vite (build tool)
- Express.js (backend API)
- PostgreSQL (database)
- OpenRouter API (AI content generation)
- Lucide React (icons)
- Recharts (data visualization)
- Tailwind CSS (via CDN)

## Project Structure
```
social-copilot/
├── App.tsx           # Main application component
├── index.tsx         # Entry point
├── index.html        # HTML template
├── components/       # React components
│   ├── Onboarding.tsx    # Creator profile setup
│   ├── ContentGenerator.tsx  # AI content generation
│   ├── Dashboard.tsx     # Main dashboard
│   ├── CalendarView.tsx  # Post calendar
│   ├── AnalyticsView.tsx # Metrics view
│   └── Layout.tsx        # App layout
├── services/         # API services
│   ├── aiService.ts      # OpenRouter AI integration
│   └── apiService.ts     # Backend API client
├── server/           # Backend server
│   └── index.js          # Express API server
├── types.ts          # TypeScript type definitions
├── vite.config.ts    # Vite configuration
└── package.json      # Dependencies
```

## Database Schema
- `posts` - Stores all generated posts with content, status, and metrics
- `creator_profiles` - Stores creator profile for AI personalization

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-configured)
- `OPENROUTER_API_KEY` - Required for AI content generation

## Development
- Frontend runs on port 5000 (Vite dev server)
- Backend API runs on port 3001 (Express)
- Vite proxy forwards `/api/*` requests to backend
- Run with workflow "Start application"

## Recent Changes
- January 21, 2026: Integração com PostgreSQL (v1.3.0)
  - Posts e perfil do criador salvos no banco de dados
  - API REST completa para CRUD de posts e perfil
  - Dados persistem permanentemente
- January 21, 2026: Sistema de Onboarding Inteligente (v1.2.0)
  - Onboarding guiado em 5 etapas para personalização do perfil do criador
  - Coleta: identidade, público-alvo, oferta, tom de voz e objetivos
  - Perfil usado como contexto fixo na geração de conteúdo pela IA
  - Perfil exibido na sidebar com opção de editar
- January 21, 2026: Melhorias no gerador de conteúdo
  - Adicionadas 3 novas plataformas: TikTok, Facebook, Threads
  - Adicionados 3 novos objetivos: Educativo, Storytelling, Humor
  - Adicionados 8 templates prontos (Lista de Dicas, História Pessoal, etc.)
  - Geração automática de hashtags via IA
  - Botão de copiar conteúdo e hashtags
  - Contador de caracteres com limite por plataforma
  - Fallback para clipboard em contextos não-seguros
- January 21, 2026: Initial setup for Replit environment
  - Configured Vite to use port 5000 with allowedHosts enabled
  - Set up deployment configuration
