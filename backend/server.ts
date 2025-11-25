import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Pool } from 'pg';
import { generateQuestionnairePdf } from './services/pdf-filler';
import { generateFormE, generateAllFormE, generateFormC, generateAllFormC, generateFormD, generateAllFormD, generateFormH, generateFormF, generateAllFormF, generateFormG } from './services/ancillary-pdf-filler';

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration for production and development
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(allowed => origin.startsWith(allowed.replace(/\/$/, '')))) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(bodyParser.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'BarSaas API' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

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
    // Try to insert. If conflict, we just return the ID.
    // Cast id to uuid and use proper enum value for department
    const result = await pool.query(
      `INSERT INTO users (id, email, questionnaire_data)
       VALUES ($1::uuid, $2, $3::jsonb)
       ON CONFLICT (id) DO NOTHING
       RETURNING id`,
      [userId, email ?? null, '{}'],
    );

    res.json({ userId: result.rows[0]?.id ?? userId });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

app.get('/api/get-draft/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const result = await pool.query('SELECT questionnaire_data FROM users WHERE id = $1::uuid', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ data: result.rows[0].questionnaire_data });
  } catch (error) {
    console.error('Error fetching draft:', error);
    res.status(500).json({ error: 'Failed to fetch draft' });
  }
});

app.post('/api/save-draft', async (req, res) => {
  const { userId, data } = req.body;
  if (!userId || !data) {
    return res.status(400).json({ error: 'Missing userId or data' });
  }

  try {
    await pool.query('UPDATE users SET questionnaire_data = $1, updated_at = NOW() WHERE id = $2::uuid', [data, userId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({ error: 'Failed to save draft' });
  }
});

app.post('/api/generate-pdf', async (req, res) => {
  try {
    const pdfBytes = await generateQuestionnairePdf(req.body.data ?? {});
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=questionnaire.pdf');
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Generate Form E (Law School Certificate) for a specific law school
app.post('/api/generate-form-e', async (req, res) => {
  try {
    const { data, lawSchoolIndex = 0 } = req.body;
    const pdfBytes = await generateFormE(data ?? {}, lawSchoolIndex);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=law-school-certificate-${lawSchoolIndex + 1}.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Error generating Form E:', error);
    res.status(500).json({ error: 'Failed to generate Law School Certificate' });
  }
});

// Generate all Form E PDFs (one per law school)
app.post('/api/generate-all-form-e', async (req, res) => {
  try {
    const { data } = req.body;
    const results = await generateAllFormE(data ?? {});
    
    // If only one law school, return single PDF
    if (results.length === 1) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=law-school-certificate.pdf`);
      res.send(Buffer.from(results[0].pdf));
      return;
    }
    
    // If multiple law schools, return JSON with base64 encoded PDFs
    // (In a production app, you might want to create a ZIP file instead)
    const response = results.map((r, i) => ({
      schoolName: r.schoolName,
      index: i,
      filename: `law-school-certificate-${i + 1}-${r.schoolName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
    }));
    
    res.json({ 
      count: results.length,
      message: `Generated ${results.length} Law School Certificate(s)`,
      forms: response,
    });
  } catch (error) {
    console.error('Error generating Form E:', error);
    res.status(500).json({ error: 'Failed to generate Law School Certificates' });
  }
});

// Generate Form C (Good Moral Character) for a specific affirmant
app.post('/api/generate-form-c', async (req, res) => {
  try {
    const { data, affirmantIndex = 0 } = req.body;
    const pdfBytes = await generateFormC(data ?? {}, affirmantIndex);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=character-affirmation-${affirmantIndex + 1}.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Error generating Form C:', error);
    res.status(500).json({ error: 'Failed to generate Character Affirmation' });
  }
});

// Generate all Form C PDFs (one per affirmant, max 2)
app.post('/api/generate-all-form-c', async (req, res) => {
  try {
    const { data } = req.body;
    const results = await generateAllFormC(data ?? {});
    
    // If only one affirmant, return single PDF
    if (results.length === 1) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=character-affirmation.pdf`);
      res.send(Buffer.from(results[0].pdf));
      return;
    }
    
    // If multiple affirmants, return info (caller should request individually)
    const response = results.map((r, i) => ({
      affirmantName: r.affirmantName,
      index: i,
      filename: `character-affirmation-${i + 1}-${r.affirmantName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
    }));
    
    res.json({ 
      count: results.length,
      message: `Generated ${results.length} Character Affirmation(s)`,
      forms: response,
    });
  } catch (error) {
    console.error('Error generating Form C:', error);
    res.status(500).json({ error: 'Failed to generate Character Affirmations' });
  }
});

// Generate Form D (Employment Affirmation) for a specific employment
app.post('/api/generate-form-d', async (req, res) => {
  try {
    const { data, affirmantIndex = 0 } = req.body;
    const pdfBytes = await generateFormD(data ?? {}, affirmantIndex);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=employment-affirmation-${affirmantIndex + 1}.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Error generating Form D:', error);
    res.status(500).json({ error: 'Failed to generate Employment Affirmation' });
  }
});

// Generate all Form D PDFs (one per employment)
app.post('/api/generate-all-form-d', async (req, res) => {
  try {
    const { data } = req.body;
    const results = await generateAllFormD(data ?? {});
    
    // If only one employment, return single PDF
    if (results.length === 1) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=employment-affirmation.pdf`);
      res.send(Buffer.from(results[0].pdf));
      return;
    }
    
    // If multiple employments, return info (caller should request individually)
    const response = results.map((r, i) => ({
      employerName: r.employerName,
      index: i,
      filename: `employment-affirmation-${i + 1}-${r.employerName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
    }));
    
    res.json({ 
      count: results.length,
      message: `Generated ${results.length} Employment Affirmation(s)`,
      forms: response,
    });
  } catch (error) {
    console.error('Error generating Form D:', error);
    res.status(500).json({ error: 'Failed to generate Employment Affirmations' });
  }
});

// Generate Form H (Skills Competency and Professional Values)
app.post('/api/generate-form-h', async (req, res) => {
  try {
    const { data } = req.body;
    const pdfBytes = await generateFormH(data ?? {});
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=skills-competency.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Error generating Form H:', error);
    res.status(500).json({ error: 'Failed to generate Skills Competency Affidavit' });
  }
});

// Generate Form F (Pro Bono 50-Hour Affidavit) for a specific placement
app.post('/api/generate-form-f', async (req, res) => {
  try {
    const { data, entryIndex = 0 } = req.body;
    const pdfBytes = await generateFormF(data ?? {}, entryIndex);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=pro-bono-affidavit-${entryIndex + 1}.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Error generating Form F:', error);
    res.status(500).json({ error: 'Failed to generate Pro Bono Affidavit' });
  }
});

// Generate all Form F PDFs (one per pro bono placement)
app.post('/api/generate-all-form-f', async (req, res) => {
  try {
    const { data } = req.body;
    const results = await generateAllFormF(data ?? {});
    
    if (results.length === 0) {
      res.status(400).json({ error: 'No pro bono entries found' });
      return;
    }
    
    if (results.length === 1) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=pro-bono-affidavit.pdf`);
      res.send(Buffer.from(results[0].pdf));
      return;
    }
    
    const response = results.map((r, i) => ({
      orgName: r.orgName,
      index: i,
      filename: `pro-bono-affidavit-${i + 1}-${r.orgName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
    }));
    
    res.json({ 
      count: results.length,
      message: `Generated ${results.length} Pro Bono Affidavit(s)`,
      forms: response,
    });
  } catch (error) {
    console.error('Error generating Form F:', error);
    res.status(500).json({ error: 'Failed to generate Pro Bono Affidavits' });
  }
});

// Generate Form G (Pro Bono Scholars Program Completion)
app.post('/api/generate-form-g', async (req, res) => {
  try {
    const { data } = req.body;
    const pdfBytes = await generateFormG(data ?? {});
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=pro-bono-scholars-completion.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Error generating Form G:', error);
    res.status(500).json({ error: 'Failed to generate Pro Bono Scholars Affidavit' });
  }
});

app.listen(port, () => {
  console.log(`Backend API running on http://localhost:${port}`);
});
