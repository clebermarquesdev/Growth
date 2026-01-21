import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import OpenAI from 'openai';

dotenv.config();
const { Pool } = pg;

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;

if (!process.env.JWT_SECRET) {
  console.error('ERRO FATAL: JWT_SECRET não está definido. Configure a variável de ambiente.');
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = '7d';
const SALT_ROUNDS = 10;

const VALID_PLATFORMS = ['linkedin', 'instagram', 'twitter', 'tiktok', 'facebook', 'threads'];
const VALID_OBJECTIVES = ['engagement', 'authority', 'sales', 'educational', 'storytelling', 'humor'];
const VALID_STATUSES = ['draft', 'scheduled', 'published'];

const allowedOrigins = [
  'http://localhost:5000',
  'http://localhost:3000',
  process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null,
  process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : null,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    const isAllowed = allowedOrigins.some(allowed => {
      const allowedHost = allowed.replace('https://', '').replace('http://', '');
      const originHost = origin.replace('https://', '').replace('http://', '');
      return originHost === allowedHost || originHost.endsWith('.' + allowedHost.split('.').slice(-2).join('.')) || originHost.includes('.replit.dev') || originHost.includes('.repl.co');
    });
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Origem não permitida pelo CORS'), false);
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Muitas requisições. Tente novamente em 1 minuto.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Muitas tentativas de cadastro. Tente novamente em 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Limite de gerações atingido. Aguarde 1 minuto.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', globalLimiter);

function authMiddleware(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Acesso não autorizado' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  return password && password.length >= 6;
}

function sanitizeText(text, maxLength = 1000) {
  if (!text || typeof text !== 'string') return '';
  return text
    .slice(0, maxLength)
    .replace(/[<>]/g, '')
    .replace(/\b(ignore|forget|disregard|override|system|prompt|instruction)/gi, '')
    .trim();
}

function validatePostInput(body) {
  const errors = [];
  
  if (!body.platform || !VALID_PLATFORMS.includes(body.platform)) {
    errors.push('Plataforma inválida');
  }
  if (!body.objective || !VALID_OBJECTIVES.includes(body.objective)) {
    errors.push('Objetivo inválido');
  }
  if (!body.topic || typeof body.topic !== 'string' || body.topic.length < 3) {
    errors.push('Tópico deve ter pelo menos 3 caracteres');
  }
  if (body.topic && body.topic.length > 500) {
    errors.push('Tópico muito longo (máximo 500 caracteres)');
  }
  if (!body.content || typeof body.content !== 'object') {
    errors.push('Conteúdo inválido');
  }
  if (body.status && !VALID_STATUSES.includes(body.status)) {
    errors.push('Status inválido');
  }
  
  return errors;
}

app.post('/api/auth/signup', signupLimiter, async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;
    
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }
    
    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'As senhas não coincidem' });
    }
    
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email ou senha inválidos' });
    }
    
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    
    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [email.toLowerCase(), passwordHash]
    );
    
    const user = result.rows[0];
    
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.status(201).json({
      user: { id: user.id, email: user.email },
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.json({
      user: { id: user.id, email: user.email },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, created_at FROM users WHERE id = $1', [req.user.userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

app.post('/api/generate', authMiddleware, aiLimiter, async (req, res) => {
  try {
    const { platform, objective, topic, creatorProfile } = req.body;
    
    if (!platform || !VALID_PLATFORMS.includes(platform)) {
      return res.status(400).json({ error: 'Plataforma inválida' });
    }
    if (!objective || !VALID_OBJECTIVES.includes(objective)) {
      return res.status(400).json({ error: 'Objetivo inválido' });
    }
    if (!topic || topic.length < 3 || topic.length > 500) {
      return res.status(400).json({ error: 'Tópico inválido' });
    }
    
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API de IA não configurada' });
    }
    
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey,
    });
    
    const sanitizedTopic = sanitizeText(topic, 500);
    
    let profileContext = '';
    if (creatorProfile) {
      const positioningLabels = {
        educator: 'Educador que ensina e compartilha conhecimento',
        authority: 'Autoridade e referência na área',
        inspirational: 'Inspirador que motiva e transforma pessoas',
        seller: 'Vendedor focado em conversão'
      };
      const toneLabels = {
        professional: 'profissional e formal',
        casual: 'casual e descontraído',
        provocative: 'provocativo que desafia o status quo',
        educational: 'didático que explica com clareza'
      };
      const lengthLabels = {
        short: 'curtos e diretos',
        medium: 'de tamanho médio e equilibrados',
        long: 'longos e mais profundos'
      };
      const audienceLevelLabels = {
        beginner: 'iniciante',
        intermediate: 'intermediário',
        advanced: 'avançado'
      };
      const goalLabels = {
        grow_audience: 'crescer audiência e ganhar seguidores',
        generate_leads: 'gerar leads e captar contatos',
        sell: 'converter seguidores em vendas'
      };
      
      profileContext = `
PERFIL DO CRIADOR:
- Profissão/Área: ${sanitizeText(creatorProfile.role, 100)}
- Experiência: ${sanitizeText(creatorProfile.experienceYears, 20)}
- Posicionamento: ${positioningLabels[creatorProfile.positioning] || creatorProfile.positioning}
- Público-alvo: ${sanitizeText(creatorProfile.audience?.profile, 200)}
- Nível do público: ${audienceLevelLabels[creatorProfile.audience?.level] || 'intermediário'}
- Principal dor: ${sanitizeText(creatorProfile.audience?.mainPain, 200)}
- Principal desejo: ${sanitizeText(creatorProfile.audience?.mainDesire, 200)}
- Tom de voz: ${toneLabels[creatorProfile.toneOfVoice] || 'profissional'}
- Preferência de posts: ${lengthLabels[creatorProfile.contentLength] || 'médio'}
- Objetivo: ${goalLabels[creatorProfile.primaryGoal] || 'crescer audiência'}
`;
    }
    
    const prompt = `
Atue como um Copywriter de Redes Sociais.

${profileContext}

Crie um post para: ${platform}
Objetivo: ${objective}
Tópico: ${sanitizedTopic}

Diretrizes:
- LinkedIn: Profissional, bom espaçamento. Limite: 3000 caracteres.
- Instagram: Engajadora, use emojis. Limite: 2200 caracteres.
- Twitter/X: Curto. Limite: 280 caracteres.
- TikTok: Casual, divertido. Limite: 2200 caracteres.
- Facebook: Conversacional. Limite: 500 caracteres.
- Threads: Similar ao Twitter. Limite: 500 caracteres.

Retorne APENAS JSON: {"hook": "...", "body": "...", "cta": "...", "tip": "...", "hashtags": ["..."]}
Responda em Português (Brasil).
`;
    
    const response = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-exp:free",
      messages: [
        {
          role: "system",
          content: "Você gera posts para redes sociais em JSON. Responda APENAS o JSON puro."
        },
        {
          role: "user",
          content: prompt
        }
      ],
    });
    
    const text = response.choices[0].message.content;
    if (text) {
      const cleanText = text.replace(/```json\n?|```/g, '').trim();
      const parsed = JSON.parse(cleanText);
      if (!parsed.hashtags || !Array.isArray(parsed.hashtags)) {
        parsed.hashtags = [];
      }
      res.json(parsed);
    } else {
      throw new Error('Resposta vazia da IA');
    }
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ error: 'Erro ao gerar conteúdo' });
  }
});

app.get('/api/posts', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query('SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    const posts = result.rows.map(row => ({
      id: row.id.toString(),
      platform: row.platform,
      objective: row.objective,
      topic: row.topic,
      content: {
        hook: row.hook,
        body: row.body,
        cta: row.cta,
        tip: row.tip,
        hashtags: row.hashtags || []
      },
      status: row.status,
      scheduledDate: row.scheduled_date,
      metrics: {
        likes: row.likes || 0,
        comments: row.comments || 0,
        shares: row.shares || 0,
        impressions: row.impressions || 0
      },
      createdAt: new Date(row.created_at).getTime()
    }));
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.post('/api/posts', authMiddleware, async (req, res) => {
  try {
    const validationErrors = validatePostInput(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: validationErrors.join(', ') });
    }
    
    const userId = req.user.userId;
    const { platform, objective, topic, content, status, scheduledDate } = req.body;
    const hashtags = content.hashtags || [];
    
    const sanitizedTopic = sanitizeText(topic, 500);
    const sanitizedHook = sanitizeText(content.hook, 500);
    const sanitizedBody = sanitizeText(content.body, 5000);
    const sanitizedCta = sanitizeText(content.cta, 500);
    const sanitizedTip = sanitizeText(content.tip, 500);
    
    const result = await pool.query(
      `INSERT INTO posts (platform, objective, topic, hook, body, cta, tip, hashtags, status, scheduled_date, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [platform, objective, sanitizedTopic, sanitizedHook, sanitizedBody, sanitizedCta, sanitizedTip, hashtags, status || 'draft', scheduledDate, userId]
    );
    const row = result.rows[0];
    const post = {
      id: row.id.toString(),
      platform: row.platform,
      objective: row.objective,
      topic: row.topic,
      content: {
        hook: row.hook,
        body: row.body,
        cta: row.cta,
        tip: row.tip,
        hashtags: row.hashtags || []
      },
      status: row.status,
      scheduledDate: row.scheduled_date,
      metrics: {
        likes: row.likes || 0,
        comments: row.comments || 0,
        shares: row.shares || 0,
        impressions: row.impressions || 0
      },
      createdAt: new Date(row.created_at).getTime()
    };
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

app.patch('/api/posts/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }
    
    const userId = req.user.userId;
    const result = await pool.query(
      'UPDATE posts SET status = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *',
      [status, id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating post status:', error);
    res.status(500).json({ error: 'Failed to update post status' });
  }
});

app.patch('/api/posts/:id/metrics', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { likes, comments } = req.body;
    
    if (typeof likes !== 'number' || typeof comments !== 'number' || likes < 0 || comments < 0) {
      return res.status(400).json({ error: 'Métricas inválidas' });
    }
    
    const userId = req.user.userId;
    const result = await pool.query(
      'UPDATE posts SET likes = $1, comments = $2, updated_at = NOW() WHERE id = $3 AND user_id = $4 RETURNING *',
      [likes, comments, id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating post metrics:', error);
    res.status(500).json({ error: 'Failed to update post metrics' });
  }
});

app.delete('/api/posts/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    await pool.query('DELETE FROM posts WHERE id = $1 AND user_id = $2', [id, userId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query('SELECT * FROM creator_profiles WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    const row = result.rows[0];
    const profile = {
      id: row.id,
      role: row.role,
      experienceYears: row.experience_years,
      positioning: row.positioning,
      audience: {
        profile: row.audience_profile,
        level: row.audience_level,
        mainPain: row.audience_main_pain,
        mainDesire: row.audience_main_desire
      },
      offer: {
        type: row.offer_type,
        mainBenefit: row.offer_main_benefit || '',
        contentFocus: row.offer_content_focus
      },
      toneOfVoice: row.tone_of_voice,
      contentLength: row.content_length,
      styleReference: row.style_reference || '',
      primaryGoal: row.primary_goal,
      mainChannels: row.main_channels || [],
      postFrequency: row.post_frequency,
      completedAt: row.completed_at
    };
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.post('/api/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      role, experienceYears, positioning, audience, offer, 
      toneOfVoice, contentLength, styleReference, primaryGoal, 
      mainChannels, postFrequency, completedAt 
    } = req.body;
    
    await pool.query('DELETE FROM creator_profiles WHERE user_id = $1', [userId]);
    
    const result = await pool.query(
      `INSERT INTO creator_profiles (
        role, experience_years, positioning, 
        audience_profile, audience_level, audience_main_pain, audience_main_desire,
        offer_type, offer_main_benefit, offer_content_focus,
        tone_of_voice, content_length, style_reference, primary_goal,
        main_channels, post_frequency, completed_at, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        sanitizeText(role, 100), experienceYears, positioning,
        sanitizeText(audience.profile, 300), audience.level, sanitizeText(audience.mainPain, 300), sanitizeText(audience.mainDesire, 300),
        offer.type, sanitizeText(offer.mainBenefit, 300) || '', offer.contentFocus,
        toneOfVoice, contentLength, sanitizeText(styleReference, 200) || '', primaryGoal,
        mainChannels, postFrequency, completedAt, userId
      ]
    );
    
    const row = result.rows[0];
    const profile = {
      id: row.id,
      role: row.role,
      experienceYears: row.experience_years,
      positioning: row.positioning,
      audience: {
        profile: row.audience_profile,
        level: row.audience_level,
        mainPain: row.audience_main_pain,
        mainDesire: row.audience_main_desire
      },
      offer: {
        type: row.offer_type,
        mainBenefit: row.offer_main_benefit || '',
        contentFocus: row.offer_content_focus
      },
      toneOfVoice: row.tone_of_voice,
      contentLength: row.content_length,
      styleReference: row.style_reference || '',
      primaryGoal: row.primary_goal,
      mainChannels: row.main_channels || [],
      postFrequency: row.post_frequency,
      completedAt: row.completed_at
    };
    res.status(201).json(profile);
  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
