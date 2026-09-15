import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kimia';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schema for Lab Session
const labSessionSchema = new mongoose.Schema({
  groupName: { type: String, required: true, unique: true },
  lastUpdated: { type: Date, default: Date.now },
  substances: { type: Object, default: {} },
  waterCalibration: { type: Object, default: {} },
  waterDensity: { type: Number },
  waterSurfaceTension: { type: Number },
  ambientTemp: { type: Number },
  pycnometerVolume: { type: Number }
});

const LabSession = mongoose.model('LabSession', labSessionSchema);


// Schema for User Auth
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'participant' } // 'admin' or 'participant'
});
const User = mongoose.model('User', userSchema);

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  
  if (username === 'admin' && password === '1238') {
    return res.json({ success: true, role: 'admin' });
  }

  try {
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ error: 'Username atau password salah!' });
    }
    res.json({ success: true, role: user.role });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/users', async (req, res) => {
  const { adminUser, adminPass, newUsername, newPassword } = req.body;
  if (adminUser !== 'admin' || adminPass !== '1238') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  if (!newUsername || !newPassword) return res.status(400).json({ error: 'Missing fields' });

  try {
    const existing = await User.findOne({ username: newUsername });
    if (existing) {
      existing.password = newPassword;
      await existing.save();
      return res.json({ success: true, message: 'User updated' });
    } else {
      const newUser = new User({ username: newUsername, password: newPassword });
      await newUser.save();
      return res.json({ success: true, message: 'User created' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/users', async (req, res) => {
  const { adminUser, adminPass } = req.query;
  if (adminUser !== 'admin' || adminPass !== '1238') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  try {
    const users = await User.find({}, 'username');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/auth/users/:username', async (req, res) => {
  const { adminUser, adminPass } = req.body;
  if (adminUser !== 'admin' || adminPass !== '1238') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  try {
    await User.deleteOne({ username: req.params.username });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


// Routes
// 1. Save or Update Session
app.post('/api/sessions', async (req, res) => {
  try {
    const { groupName, data } = req.body;
    
    if (!groupName) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const session = await LabSession.findOneAndUpdate(
      { groupName },
      { 
        $set: {
          lastUpdated: Date.now(),
          substances: data.substances,
          waterCalibration: data.waterCalibration,
          waterDensity: data.waterDensity,
          waterSurfaceTension: data.waterSurfaceTension,
          ambientTemp: data.ambientTemp,
          pycnometerVolume: data.pycnometerVolume
        }
      },
      { new: true, upsert: true } // upsert creates if it doesn't exist
    );

    res.json({ success: true, message: 'Data saved successfully', session });
  } catch (err) {
    console.error('Error saving session:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Load Session
app.get('/api/sessions/:groupName', async (req, res) => {
  try {
    const { groupName } = req.params;
    const session = await LabSession.findOne({ groupName });
    
    if (!session) {
      return res.status(404).json({ error: 'Data not found for this group' });
    }

    res.json({ success: true, data: session });
  } catch (err) {
    console.error('Error loading session:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static frontend build from dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// SPA Fallback: send index.html for non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
