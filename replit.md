# Social Copilot

## Overview
A React-based social media content assistant powered by Google Gemini AI. The application helps users with social media content creation and management.

## Tech Stack
- React 19
- TypeScript
- Vite (build tool)
- Google Gemini AI API (@google/genai)
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
├── services/         # API services (Gemini integration)
├── types.ts          # TypeScript type definitions
├── vite.config.ts    # Vite configuration
└── package.json      # Dependencies
```

## Environment Variables
- `GEMINI_API_KEY` - Required for Google Gemini AI API access

## Development
- Dev server runs on port 5000
- Run with `npm run dev` from the social-copilot directory
- Build with `npm run build`

## Recent Changes
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
