import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

dotenv.config();
const { Pool } = pg;

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'social-copilot-jwt-secret-change-in-production';
const JWT_EXPIRY = '7d';
const SALT_ROUNDS = 10;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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
    const userId = req.user.userId;
    const { platform, objective, topic, content, status, scheduledDate } = req.body;
    const hashtags = content.hashtags || [];
    const result = await pool.query(
      `INSERT INTO posts (platform, objective, topic, hook, body, cta, tip, hashtags, status, scheduled_date, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [platform, objective, topic, content.hook, content.body, content.cta, content.tip, hashtags, status, scheduledDate, userId]
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
        role, experienceYears, positioning,
        audience.profile, audience.level, audience.mainPain, audience.mainDesire,
        offer.type, offer.mainBenefit || '', offer.contentFocus,
        toneOfVoice, contentLength, styleReference || '', primaryGoal,
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
