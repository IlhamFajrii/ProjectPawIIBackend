import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { errorHandler, notFound } from './middleware/error.js';
import ai from './routes/ai.js';
import auth from './routes/auth.js';
import circles from './routes/circles.js';
import conversations from './routes/conversations.js';
import disputes from './routes/disputes.js';
import listings from './routes/listings.js';
import orders from './routes/orders.js';
import users from './routes/users.js';
import { HttpError, ok } from './utils/http.js';

const app = express();
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // Mulai pendek, naikkan setelah HTTPS terbukti stabil.
    'Strict-Transport-Security': 'max-age=300',
  });
  next();
});

const origins = (process.env.CORS_ORIGIN ?? '').split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors({ origin: origins }));

app.get('/api/health', async (req, res) => {
  try {
    await connectDB();
    await mongoose.connection.db.admin().ping();
  } catch (error) {
    console.error('Health check gagal:', error.name);
    throw new HttpError(500, 'Database tidak terhubung');
  }
  ok(res, { status: 'ok', database: 'connected' });
});

app.use('/api', async (req, res, next) => {
  await connectDB();
  next();
});

app.use('/api/ai', ai); // sebelum parser global yang dibatasi 100 KB
app.use(express.json());
app.use((req, res, next) => {
  req.body ??= {};
  next();
});

app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/listings', listings);
app.use('/api/orders', orders);
app.use('/api/disputes', disputes);
app.use('/api/circles', circles);
app.use('/api/conversations', conversations);

app.use(notFound);
app.use(errorHandler);

export default app;
