# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

## [1.2.0] - 2026-01-21

### Adicionado

#### Sistema de Onboarding Inteligente (Creator Profiling)
Novo fluxo de onboarding guiado em 5 etapas para personalizar a geração de conteúdo:

**Etapa 1 - Identidade do Criador**
- Definição profissional (ex: Fundador de SaaS, Coach, Social Media)
- Tempo de experiência na área
- Posicionamento: Educador, Autoridade, Inspirador ou Vendedor

**Etapa 2 - Público-Alvo**
- Perfil do público principal
- Nível do público: Iniciante, Intermediário ou Avançado
- Principal dor do público
- Principal desejo ou objetivo do público

**Etapa 3 - Produto/Oferta**
- Tipo de oferta: Produto, Serviço, Conteúdo Gratuito ou Nada ainda
- Principal resultado que a oferta entrega
- Foco do conteúdo: Autoridade, Relacionamento ou Venda

**Etapa 4 - Tom de Voz e Estilo**
- Tom de voz: Profissional, Casual, Provocativo ou Didático
- Preferência de tamanho: Curto, Médio ou Longo
- Referência de estilo (opcional)

**Etapa 5 - Objetivos de Conteúdo**
- Objetivo principal: Crescer Audiência, Gerar Leads ou Vender
- Redes sociais de foco (múltipla seleção)
- Frequência de postagem

#### Integração do Perfil com a IA
- Perfil do criador é usado como contexto fixo em todas as gerações
- A IA ajusta linguagem, profundidade e CTA baseado no perfil
- Prompt personalizado considera dores, desejos e tom de voz do criador

#### Interface do Usuário
- Barra de progresso visual no onboarding
- Exemplos em cada pergunta para facilitar respostas
- Perfil do criador exibido na sidebar
- Botão de editar perfil nas configurações
- Validação inteligente por etapa

### Alterado
- Plataforma padrão no gerador agora é baseada nas preferências do perfil
- Layout atualizado para mostrar informações do perfil do criador

### Técnico
- Novo modelo de dados `CreatorProfile` com tipos TypeScript
- Perfil salvo no localStorage para persistência
- Função `buildProfileContext()` para construir contexto da IA

---

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
