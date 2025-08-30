import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());

// Initialize OpenAI client with your server-side key
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Health check (optional)
app.get('/health', (_req, res) => res.json({ ok: true }));

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body || {};
    if (!Array.isArray(messages)) {
      return res
        .status(400)
        .json({ error: 'messages must be an array of {role, content}' });
    }

    const result = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,              // [{ role: 'user'|'assistant', content: '...' }]
      temperature: 0.7
    });

    const reply = result.choices?.[0]?.message?.content ?? '';
    res.json({ reply });
  } catch (e) {
    console.error('OpenAI error:', e?.response?.data || e?.message || e);
    res.status(500).json({
      error: 'OpenAI request failed',
      detail: e?.response?.data || e?.message || String(e)
    });
  }
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
