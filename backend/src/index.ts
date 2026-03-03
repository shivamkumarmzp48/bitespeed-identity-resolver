import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './database/db';
import authRoutes from './routes/auth.routes';
import identifyRoutes from './routes/identify.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Get allowed origins from environment variable (comma-separated list) or use defaults
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://bitespeed-identity-resolver.vercel.app',
      'https://bitespeed-identity-resolver-fe5v505iy.vercel.app' // your current frontend
    ];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or same-origin requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`Blocked origin: ${origin}`); // helpful for debugging
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/identify', identifyRoutes);

// Health check endpoint (optional but useful)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Root endpoint (optional)
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bitespeed Identity Resolver API',
    endpoints: {
      auth: '/api/auth',
      identify: '/api/identify',
      health: '/api/health'
    }
  });
});

// Start server
initDb().then(() => {
  app.listen(port, () => {
    console.log(`✅ Server running on port ${port}`);
    console.log(`🌐 Allowed origins:`, allowedOrigins);
  });
}).catch(err => {
  console.error('❌ Failed to initialize database:', err);
  process.exit(1); // exit if database fails
});
