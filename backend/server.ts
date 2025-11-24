import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Pool } from 'pg';
import { generateQuestionnairePdf } from './services/pdf-filler';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : undefined,
});

app.post('/api/init-session', async (req, res) => {
  const { userId, email } = req.body ?? {};

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO users (id, email, department, questionnaire_data)
       VALUES ($1, $2, $3, $4::jsonb)
       ON CONFLICT (id) DO NOTHING
       RETURNING id`,
      [userId, email ?? null, 'AD3', '{}'],
    );

    res.json({ userId: result.rows[0]?.id ?? userId });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

app.post('/api/save-draft', async (req, res) => {
  const { userId, data } = req.body;
  if (!userId || !data) {
    return res.status(400).json({ error: 'Missing userId or data' });
  }

  try {
    await pool.query('UPDATE users SET questionnaire_data = $1 WHERE id = $2', [data, userId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({ error: 'Failed to save draft' });
  }
});

app.post('/api/generate-pdf', async (req, res) => {
  try {
    // Placeholder for upcoming PDF generation integration
    await generateQuestionnairePdf(req.body.data ?? {});
    res.json({ success: true, message: 'PDF generation queued' });
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

app.listen(port, () => {
  console.log(`Backend API running on http://localhost:${port}`);
});

