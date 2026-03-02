import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool, initDb } from './database/db';
import authRoutes from './routes/auth.routes';
import identifyRoutes from './routes/identify.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for testing
  credentials: true
}));
app.use(express.json());

// ========== ROUTES ==========

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bitespeed Identity Resolver API',
    status: 'running',
    endpoints: {
      root: 'GET /',
      health: 'GET /api/health',
      healthDb: 'GET /api/health/db',
      signup: 'POST /api/auth/signup',
      login: 'POST /api/auth/login',
      identify: 'POST /api/identify (requires token)'
    }
  });
});

// Health check endpoints
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as time');
    res.json({ 
      status: 'ok', 
      database: 'connected',
      time: result.rows[0].time
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// IMPORTANT: Register routes with /api prefix
app.use('/api/auth', authRoutes);
app.use('/api/identify', identifyRoutes);

// 404 handler - shows available endpoints
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'GET /api/health/db',
      'POST /api/auth/signup',
      'POST /api/auth/login',
      'POST /api/identify (Authorization: Bearer <token>)'
    ]
  });
});

// ========== START SERVER ==========
initDb().then(() => {
  app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${port}`);
    console.log(`📍 URL: https://bitespeed-backend-td52.onrender.com`);
    console.log(`📍 Test health: https://bitespeed-backend-td52.onrender.com/api/health`);
  });
}).catch(err => {
  console.error('❌ Failed to initialize database:', err);
});
