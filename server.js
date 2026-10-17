const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');

const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname)));

// User storage
const USERS_PATH = path.join(__dirname, 'data', 'users.json');
function loadUsers(){
  try { return JSON.parse(fs.readFileSync(USERS_PATH, 'utf8')); } catch(e){ return []; }
}
function saveUsers(users){ fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), 'utf8'); }

// SMTP transporter (optional). Configure via environment variables if you later want email features
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  try {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: (process.env.SMTP_SECURE === 'true'),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    console.log('SMTP transporter configured');
  } catch (e) {
    console.warn('Failed to configure SMTP transporter:', e);
    transporter = null;
  }
}

// Registration endpoint (accepts password when available)
app.post('/api/register', (req, res) => {
  const { name, age, email, password } = req.body || {};
  if (!name || !age || !email || !password) return res.json({ success: false, message: 'Missing fields.' });
  const users = loadUsers();
  if (users.find(u => u.email === email)) return res.json({ success: false, message: 'Email already registered.' });
  // Hash password server-side
  const passwordHash = bcrypt.hashSync(password, 10);
  users.push({ name, age, email, passwordHash, createdAt: Date.now() });
  saveUsers(users);
  return res.json({ success: true });
});

// Login endpoint (password-based). Accepts { email, password }
app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.json({ success: false, message: 'Missing email or password.' });
  const users = loadUsers();
  const user = users.find(u => u.email === email);
  if (!user) return res.json({ success: false, message: 'Email not registered.' });
  if (!user.passwordHash) return res.json({ success: false, message: 'No password set for this user.' });
  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) return res.json({ success: false, message: 'Invalid credentials.' });
  // Authentication successful
  return res.json({ success: true });
});

// (OTP endpoints removed — login now uses password-based authentication)

// Load embeddings if available
let EMBEDDINGS = null;
const EMB_PATH = path.join(__dirname, 'data', 'embeddings.json');
if (fs.existsSync(EMB_PATH)) {
  try {
    EMBEDDINGS = JSON.parse(fs.readFileSync(EMB_PATH, 'utf8'));
    console.log(`Loaded ${EMBEDDINGS.length} embeddings from ${EMB_PATH}`);
  } catch (e) {
    console.warn('Failed to load embeddings:', e);
    EMBEDDINGS = null;
  }
}

// Initialize OpenAI client if key is present
const OPENAI_KEY = process.env.OPENAI_API_KEY || null;
let openai = null;
if (OPENAI_KEY) {
  openai = new OpenAI({ apiKey: OPENAI_KEY });
  console.log('OpenAI client initialized');
} else {
  console.log('OPENAI_API_KEY not set — API endpoints will fallback to rule-based responses');
}

// Tiny cosine similarity helper
function dot(a, b){
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i]*b[i];
  return s;
}
function norm(a){
  let s = 0; for (let i=0;i<a.length;i++) s += a[i]*a[i]; return Math.sqrt(s);
}
function cosineSim(a, b){ return dot(a,b)/(norm(a)*norm(b) + 1e-10); }

// POST /api/chat — do RAG if embeddings + API key available, else return null to let frontend fallback
app.post('/api/chat', async (req, res) => {
  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: 'missing message' });

  // If embeddings + openai present, do RAG
  if (openai && EMBEDDINGS && EMBEDDINGS.length > 0) {
    try {
      // Create embedding for query
      const embResp = await openai.embeddings.create({ model: 'text-embedding-3-small', input: message });
      const qEmb = embResp.data[0].embedding;

      // Score all docs (naive linear search)
      const scores = EMBEDDINGS.map(doc => ({ id: doc.id, score: cosineSim(qEmb, doc.embedding), text: doc.text, meta: doc.meta }));
      scores.sort((a,b) => b.score - a.score);
      const topK = scores.slice(0,6);

      // Build context
      const context = topK.map(s => `Title: ${s.meta && s.meta.title ? s.meta.title : s.id}\nTopics: ${s.meta && s.meta.topics ? s.meta.topics : ''}\nContent: ${s.text}\nSource: ${s.meta && s.meta.link ? s.meta.link : ''}`).join('\n\n---\n\n');

      const system = `You are LeetCrack assistant. Use the provided context to answer concisely. If the answer is not contained in the context, answer from general knowledge but do not hallucinate facts about specific problems. Include a short 'Sources' section listing the context items used.`;
      const userPrompt = `Context:\n${context}\n\nQuestion:\n${message}`;

      const chatResp = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 700
      });

      const reply = chatResp.choices && chatResp.choices[0] && chatResp.choices[0].message ? chatResp.choices[0].message.content : 'Sorry, I could not generate a response.';

      return res.json({ reply, sources: topK.map(t => t.meta) });
    } catch (e) {
      console.error('RAG error:', e);
      return res.status(500).json({ error: 'RAG error', details: String(e) });
    }
  }

  // Fallback: tell frontend to use local logic
  return res.json({ reply: null });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
