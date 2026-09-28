```js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import predictionRoutes from './routes/predictionRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const app = express();

// ===============================
// CORS
// ===============================

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// ===============================
// JSON BODY PARSER
// ===============================

app.use(express.json());

// ===============================
// API ROUTES
// ===============================

app.use('/api', predictionRoutes);

app.use('/api/ai', aiRoutes);

// ===============================
// BASE ROUTE
// ===============================

app.get('/', (req, res) => {
  res.json({
    name: 'Smart Attendance AI API',
    status: 'Running',
    version: '1.0.0',
    endpoints: [
      'GET /api/health',
      'POST /api/predict',
      'POST /api/simulate-leave',
      'GET /api/model-info',
      'POST /api/ai/chat'
    ]
  });
});

// ===============================
// GLOBAL ERROR HANDLER
// ===============================

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);

  res.status(500).json({
    success: false,
    error: 'Internal server error occurred. Please try again.'
  });
});

// ===============================
// VERCEL
// ===============================

export default app;
```
