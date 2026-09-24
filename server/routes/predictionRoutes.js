import express from 'express';
import {
  getHealth,
  predictAttendance,
  simulateLeave,
  getModelDetails
} from '../controllers/predictionController.js';

const router = express.Router();

router.get('/health', getHealth);
router.post('/predict', predictAttendance);
router.post('/simulate-leave', simulateLeave);
router.get('/model-info', getModelDetails);

export default router;
