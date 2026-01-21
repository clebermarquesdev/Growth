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
      id: row.id,
      platform: row.platform,
      objective: row.objective,
      topic: row.topic,
      content: {
        hook: row.hook,
        body: row.body,
        cta: row.cta,
        tip: row.tip
      },
      status: row.status,
      scheduledDate: row.scheduled_date,
      metrics: {
        likes: row.likes,
        comments: row.comments
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
    const result = await pool.query(
      `INSERT INTO posts (platform, objective, topic, hook, body, cta, tip, status, scheduled_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [platform, objective, topic, content.hook, content.body, content.cta, content.tip, status, scheduledDate]
    );
    const row = result.rows[0];
    const post = {
      id: row.id,
      platform: row.platform,
      objective: row.objective,
      topic: row.topic,
      content: {
        hook: row.hook,
        body: row.body,
        cta: row.cta,
        tip: row.tip
      },
      status: row.status,
      scheduledDate: row.scheduled_date,
      metrics: {
        likes: row.likes,
        comments: row.comments
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
