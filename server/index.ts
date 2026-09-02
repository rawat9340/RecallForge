import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import studyRouter from './routes/study';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0 && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');
  res.json({
    status: 'ok',
    service: 'RecallForge API',
    mode: hasKey ? 'live-gemini' : 'mock-fallback',
    geminiConfigured: hasKey,
  });
});

// Mount study generation routes
app.use('/api/study', studyRouter);

// Centralized error handling middleware for API routes
app.use(errorHandler);

// Serve frontend static build files in production (or when dist exists)
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

// For all non-API GET requests, serve index.html (SPA fallback)
app.get('*', (req, res) => {
  // If the request was intended for an undefined API route, return 404 JSON
  if (req.path.startsWith('/api')) {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'The requested API endpoint does not exist.',
      },
    });
    return;
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[RecallForge Server] Running on http://localhost:${PORT}`);
  });
}

export default app;
