import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ---------------------------------------------------------------------------
// Konfigurasi
// ---------------------------------------------------------------------------
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kimia';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
// Kunci penanda tangan token. Bila AUTH_SECRET tidak diatur, diturunkan dari
// rahasia lain yang sudah ada di server agar tetap stabil antar-deploy.
const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  crypto.createHash('sha256').update(`srslab:${ADMIN_PASSWORD}:${MONGODB_URI}`).digest('hex');
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 jam, cukup untuk satu sesi praktikum

// Modul yang dikenal server. Data modul pertama disimpan di field lama
// (substances/calibration) agar data periode 1 tetap terbaca.
const MODULES = ['tegangan-permukaan', 'inversi-gula'];
const LEGACY_MODULE = 'tegangan-permukaan';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

// ---------------------------------------------------------------------------
// Skema
// ---------------------------------------------------------------------------
const labSessionSchema = new mongoose.Schema({
  groupName: { type: String, required: true, unique: true },
  lastUpdated: { type: Date, default: Date.now },
  substances: { type: Object, default: {} },
  calibration: { type: Object, default: {} },
  modules: { type: Object, default: {} },        // { 'inversi-gula': {...} }
  moduleUpdated: { type: Object, default: {} },  // { 'inversi-gula': Date }
}, { minimize: false });
const LabSession = mongoose.model('LabSession', labSessionSchema);

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String },        // lama (teks biasa) — dimigrasi saat login
  passwordHash: { type: String },    // scrypt: salt:hash (hex)
  role: { type: String, default: 'participant' },
  displayName: { type: String, default: '' },
  members: { type: [String], default: [] },
  order: { type: Number, default: 0 },
});
const User = mongoose.model('User', userSchema);

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed },
  updatedAt: { type: Date, default: Date.now },
});
const Setting = mongoose.model('Setting', settingSchema);

// ---------------------------------------------------------------------------
// Helper keamanan
// ---------------------------------------------------------------------------
function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(plain, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(plain, stored) {
  const [salt, hash] = String(stored || '').split(':');
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(plain, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return expected.length === candidate.length && crypto.timingSafeEqual(candidate, expected);
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

function signToken(payload) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + TOKEN_TTL_MS })).toString('base64url');
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verifyToken(token) {
  const [body, sig] = String(token || '').split('.');
  if (!body || !sig) return null;
  const expected = crypto.createHmac('sha256', AUTH_SECRET).update(body).digest('base64url');
  if (!safeEqual(sig, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function requireAuth(req, res, next) {
  const header = req.get('authorization') || '';
  const payload = verifyToken(header.replace(/^Bearer\s+/i, ''));
  if (!payload) return res.status(401).json({ error: 'Sesi berakhir. Silakan masuk kembali.' });
  req.auth = payload; // { sub, role }
  next();
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.auth.role !== 'admin') return res.status(403).json({ error: 'Akses khusus aslab.' });
    next();
  });
}

// Pembatas percobaan login sederhana (per instance server)
const loginFailures = new Map();
const MAX_FAILS = 8;
const FAIL_WINDOW_MS = 10 * 60 * 1000;
function isLocked(key) {
  const entry = loginFailures.get(key);
  if (!entry) return false;
  if (Date.now() - entry.first > FAIL_WINDOW_MS) { loginFailures.delete(key); return false; }
  return entry.count >= MAX_FAILS;
}
function recordFailure(key) {
  const entry = loginFailures.get(key);
  if (!entry || Date.now() - entry.first > FAIL_WINDOW_MS) loginFailures.set(key, { count: 1, first: Date.now() });
  else entry.count += 1;
}

const publicUser = (u) => ({
  username: u.username,
  displayName: u.displayName || u.username,
  members: u.members || [],
  role: u.role || 'participant',
});

const ADMIN_PROFILE = { username: ADMIN_USERNAME, displayName: 'Asisten Laboratorium', members: [], role: 'admin' };

// ---------------------------------------------------------------------------
// Auth & daftar kelompok
// ---------------------------------------------------------------------------
// Daftar kelompok untuk dropdown login (tanpa nama anggota)
app.get('/api/groups', async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }, 'username displayName order').lean();
    users.sort((a, b) => (a.order || 0) - (b.order || 0) ||
      String(a.displayName || a.username).localeCompare(String(b.displayName || b.username), 'id', { numeric: true }));
    res.json({ success: true, groups: users.map(u => ({ username: u.username, displayName: u.displayName || u.username })) });
  } catch (err) {
    console.error('Error listing groups:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const username = String(req.body?.username || '').trim();
  const password = String(req.body?.password || '');
  if (!username || !password) return res.status(400).json({ error: 'Kelompok dan kode akses wajib diisi.' });

  const lockKey = `${req.ip}|${username}`;
  if (isLocked(lockKey)) return res.status(429).json({ error: 'Terlalu banyak percobaan. Coba lagi 10 menit lagi.' });

  if (username === ADMIN_USERNAME) {
    if (!ADMIN_PASSWORD) return res.status(503).json({ error: 'Password aslab belum diatur di server (ADMIN_PASSWORD).' });
    if (!safeEqual(password, ADMIN_PASSWORD)) {
      recordFailure(lockKey);
      return res.status(401).json({ error: 'Password aslab salah.' });
    }
    loginFailures.delete(lockKey);
    return res.json({ success: true, token: signToken({ sub: ADMIN_USERNAME, role: 'admin' }), user: ADMIN_PROFILE });
  }

  try {
    const user = await User.findOne({ username });
    let ok = false;
    if (user?.passwordHash) {
      ok = verifyPassword(password, user.passwordHash);
    } else if (user?.password) {
      // Akun lama dengan password teks biasa: cocokkan lalu migrasikan ke hash
      ok = safeEqual(password, user.password);
      if (ok) {
        user.passwordHash = hashPassword(password);
        user.password = undefined;
        await user.save();
      }
    }
    if (!ok) {
      recordFailure(lockKey);
      return res.status(401).json({ error: 'Kelompok atau kode akses salah.' });
    }
    loginFailures.delete(lockKey);
    res.json({ success: true, token: signToken({ sub: user.username, role: user.role || 'participant' }), user: publicUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  if (req.auth.role === 'admin') return res.json({ success: true, user: ADMIN_PROFILE });
  try {
    const user = await User.findOne({ username: req.auth.sub }).lean();
    if (!user) return res.status(401).json({ error: 'Akun tidak ditemukan.' });
    res.json({ success: true, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------------------------------------------------------------------------
// Pengumuman aslab
// ---------------------------------------------------------------------------
app.get('/api/announcement', requireAuth, async (req, res) => {
  try {
    const doc = await Setting.findOne({ key: 'announcement' }).lean();
    res.json({ success: true, text: doc?.value || '', updatedAt: doc?.updatedAt || null });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/announcement', requireAdmin, async (req, res) => {
  const text = String(req.body?.text || '').slice(0, 1000);
  try {
    await Setting.findOneAndUpdate({ key: 'announcement' }, { value: text, updatedAt: Date.now() }, { upsert: true });
    res.json({ success: true, text });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------------------------------------------------------------------------
// Admin: kelola kelompok
// ---------------------------------------------------------------------------
app.get('/api/admin/groups', requireAdmin, async (req, res) => {
  try {
    const [users, sessions] = await Promise.all([
      User.find({ role: { $ne: 'admin' } }, 'username displayName members order').lean(),
      LabSession.find({}, 'groupName lastUpdated moduleUpdated').lean(),
    ]);
    const byGroup = new Map(sessions.map(s => [s.groupName, s]));
    users.sort((a, b) => (a.order || 0) - (b.order || 0) ||
      String(a.displayName || a.username).localeCompare(String(b.displayName || b.username), 'id', { numeric: true }));
    res.json({
      success: true,
      groups: users.map(u => {
        const s = byGroup.get(u.username);
        return {
          ...publicUser(u),
          order: u.order || 0,
          saved: {
            'tegangan-permukaan': s?.lastUpdated || null,
            'inversi-gula': s?.moduleUpdated?.['inversi-gula'] || null,
          },
        };
      }),
    });
  } catch (err) {
    console.error('Error fetching groups:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/groups', requireAdmin, async (req, res) => {
  const username = String(req.body?.username || '').trim();
  const password = String(req.body?.password || '').trim();
  const displayName = String(req.body?.displayName || '').trim();
  const members = Array.isArray(req.body?.members)
    ? req.body.members.map(m => String(m).trim()).filter(Boolean).slice(0, 20)
    : [];
  const order = Number.isFinite(Number(req.body?.order)) ? Number(req.body.order) : 0;

  if (!username) return res.status(400).json({ error: 'ID kelompok wajib diisi.' });
  if (username === ADMIN_USERNAME) return res.status(400).json({ error: 'ID "admin" tidak boleh dipakai.' });

  try {
    const existing = await User.findOne({ username });
    if (existing) {
      existing.displayName = displayName;
      existing.members = members;
      existing.order = order;
      if (password) {
        existing.passwordHash = hashPassword(password);
        existing.password = undefined;
      }
      await existing.save();
      return res.json({ success: true, message: `Kelompok "${displayName || username}" diperbarui.` });
    }
    if (!password) return res.status(400).json({ error: 'Kode akses wajib diisi untuk kelompok baru.' });
    await User.create({ username, displayName, members, order, passwordHash: hashPassword(password) });
    res.json({ success: true, message: `Kelompok "${displayName || username}" ditambahkan.` });
  } catch (err) {
    console.error('Error saving group:', err);
    res.status(500).json({ error: 'Gagal menyimpan kelompok.' });
  }
});

app.delete('/api/admin/groups/:username', requireAdmin, async (req, res) => {
  try {
    await User.deleteOne({ username: req.params.username, role: { $ne: 'admin' } });
    res.json({ success: true, message: 'Kelompok dihapus.' });
  } catch (err) {
    console.error('Error deleting group:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------------------------------------------------------------------------
// Data praktikum per modul
// ---------------------------------------------------------------------------
// Praktikan hanya bisa mengakses data kelompoknya sendiri; aslab boleh memilih
// kelompok lewat ?group= (GET) atau body.group (POST).
function resolveGroup(req, requested) {
  if (req.auth.role === 'admin') return String(requested || '').trim();
  return req.auth.sub;
}

app.get('/api/sessions/:module', requireAuth, async (req, res) => {
  const { module } = req.params;
  if (!MODULES.includes(module)) return res.status(404).json({ error: 'Modul tidak dikenal.' });
  const groupName = resolveGroup(req, req.query.group);
  if (!groupName) return res.status(400).json({ error: 'Nama kelompok wajib diisi.' });

  res.set({ 'Cache-Control': 'no-store' });
  try {
    const session = await LabSession.findOne({ groupName }).lean();
    const data = module === LEGACY_MODULE
      ? (session && Object.keys(session.substances || {}).length ? { substances: session.substances, calibration: session.calibration } : null)
      : session?.modules?.[module] || null;
    if (!data) return res.status(404).json({ error: 'Belum ada data tersimpan untuk kelompok ini.' });
    const lastUpdated = module === LEGACY_MODULE ? session.lastUpdated : session.moduleUpdated?.[module];
    res.json({ success: true, data, lastUpdated });
  } catch (err) {
    console.error('Error loading session:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/sessions/:module', requireAuth, async (req, res) => {
  const { module } = req.params;
  if (!MODULES.includes(module)) return res.status(404).json({ error: 'Modul tidak dikenal.' });
  const groupName = resolveGroup(req, req.body?.group);
  const data = req.body?.data;
  if (!groupName) return res.status(400).json({ error: 'Nama kelompok wajib diisi.' });
  if (!data || typeof data !== 'object') return res.status(400).json({ error: 'Data kosong.' });

  const now = Date.now();
  const update = module === LEGACY_MODULE
    ? { lastUpdated: now, substances: data.substances, calibration: data.calibration }
    : { [`modules.${module}`]: data, [`moduleUpdated.${module}`]: now };
  try {
    await LabSession.findOneAndUpdate({ groupName }, { $set: update }, { upsert: true });
    res.json({ success: true, message: 'Data tersimpan.', lastUpdated: now });
  } catch (err) {
    console.error('Error saving session:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// Frontend
// ---------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/api', (req, res) => res.status(404).json({ error: 'Endpoint tidak ditemukan.' }));
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
