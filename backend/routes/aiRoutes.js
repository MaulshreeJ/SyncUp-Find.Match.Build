import express from 'express';
import { 
  chatWithGemini, 
  getChatHistory, 
  saveChatSession,
  deleteChatSession 
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public chat endpoint (for anonymous users)
router.post('/chat', chatWithGemini);

// Protected routes for authenticated users
router.get('/history', protect, getChatHistory);
router.post('/history', protect, saveChatSession);
router.delete('/history/:sessionId', protect, deleteChatSession);

export default router;
