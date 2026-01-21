# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

## [1.1.0] - 2026-01-21

### Adicionado

#### Novas Plataformas
- TikTok - suporte para conteúdo casual e divertido
- Facebook - suporte para tom conversacional
- Threads - suporte similar ao Twitter, mais conversacional

#### Novos Objetivos/Tons de Voz
- Educativo - para ensinar algo valioso com dicas práticas
- Storytelling - para contar histórias pessoais ou cases de sucesso
- Humor/Descontraído - para conteúdo leve e engraçado

#### Templates Prontos
- Lista de Dicas - X dicas/erros/passos sobre um tema
- História Pessoal - conte uma experiência transformadora
- Opinião Polêmica - compartilhe uma visão diferente
- Tutorial Rápido - ensine algo passo a passo
- Antes e Depois - mostre uma transformação
- Pergunta Engajadora - inicie um debate com seu público
- Mito x Verdade - desmistifique crenças comuns
- Comentário de Tendência - opine sobre algo em alta

#### Funcionalidades do Gerador
- Geração automática de hashtags via IA (5-8 hashtags relevantes)
- Botão de copiar conteúdo completo com hashtags
- Botão de copiar apenas as hashtags
- Contador de caracteres com limite por plataforma
- Aviso visual quando o conteúdo ultrapassa o limite de caracteres
- Fallback para clipboard em contextos não-seguros (HTTP)

### Alterado
- Interface de seleção de objetivos agora usa botões em grid ao invés de dropdown
- Templates são filtrados automaticamente por plataforma selecionada
- Prompt da IA melhorado com diretrizes específicas por plataforma e objetivo

### Limites de Caracteres por Plataforma
- LinkedIn: 3000 caracteres
- Instagram: 2200 caracteres
- Twitter/X: 280 caracteres
- TikTok: 2200 caracteres
- Facebook: 500 caracteres
- Threads: 500 caracteres

## [1.0.0] - 2026-01-21

### Adicionado
- Setup inicial do projeto React com TypeScript e Vite
- Integração com Google Gemini AI para geração de conteúdo
- Dashboard com visão geral de posts
- Gerador de conteúdo com IA
- Calendário de posts
- Analytics de desempenho
- Suporte inicial para LinkedIn, Instagram e Twitter/X
- Objetivos: Engajamento, Autoridade e Vendas/Leads
- Configuração para ambiente Replit (porta 5000)
