import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './database/db';
import authRoutes from './routes/auth.routes';
import identifyRoutes from './routes/identify.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/identify', identifyRoutes);

initDb().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});