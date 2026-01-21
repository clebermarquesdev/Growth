import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get('/api/posts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
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

app.post('/api/posts', async (req, res) => {
  try {
    const { platform, objective, topic, content, status, scheduledDate } = req.body;
    const hashtags = content.hashtags || [];
    const result = await pool.query(
      `INSERT INTO posts (platform, objective, topic, hook, body, cta, tip, hashtags, status, scheduled_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [platform, objective, topic, content.hook, content.body, content.cta, content.tip, hashtags, status, scheduledDate]
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

app.patch('/api/posts/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await pool.query(
      'UPDATE posts SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
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

app.patch('/api/posts/:id/metrics', async (req, res) => {
  try {
    const { id } = req.params;
    const { likes, comments } = req.body;
    const result = await pool.query(
      'UPDATE posts SET likes = $1, comments = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [likes, comments, id]
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

app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM posts WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

app.get('/api/profile', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM creator_profiles ORDER BY created_at DESC LIMIT 1');
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

app.post('/api/profile', async (req, res) => {
  try {
    const { 
      role, experienceYears, positioning, audience, offer, 
      toneOfVoice, contentLength, styleReference, primaryGoal, 
      mainChannels, postFrequency, completedAt 
    } = req.body;
    
    await pool.query('DELETE FROM creator_profiles');
    
    const result = await pool.query(
      `INSERT INTO creator_profiles (
        role, experience_years, positioning, 
        audience_profile, audience_level, audience_main_pain, audience_main_desire,
        offer_type, offer_main_benefit, offer_content_focus,
        tone_of_voice, content_length, style_reference, primary_goal,
        main_channels, post_frequency, completed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        role, experienceYears, positioning,
        audience.profile, audience.level, audience.mainPain, audience.mainDesire,
        offer.type, offer.mainBenefit || '', offer.contentFocus,
        toneOfVoice, contentLength, styleReference || '', primaryGoal,
        mainChannels, postFrequency, completedAt
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
