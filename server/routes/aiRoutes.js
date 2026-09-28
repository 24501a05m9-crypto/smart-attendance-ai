import express from 'express';
import { chatWithSynapse } from '../controllers/aiController.js';

const router = express.Router();

router.post('/chat', chatWithSynapse);

export default router;