import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import predictionRoutes from './routes/predictionRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json());

// ===============================
// API ROUTES
// ===============================

// Existing prediction / ML routes
app.use('/api', predictionRoutes);

// New Synapse AI routes
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
// START SERVER
// ===============================

app.listen(PORT, () => {
  console.log(
    `[Smart Attendance AI] Node.js Express server running on http://localhost:${PORT}`
  );

  console.log(
    `[Smart Attendance AI] Forwarding ML requests to ${
      process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000'
    }`
  );

  console.log(
    '[Smart Attendance AI] Synapse AI endpoint available at http://localhost:' +
      `${PORT}/api/ai/chat`
  );
});