import express from 'express';
import { 
  getMyTicket, 
  getTickets, 
  getMessages,
  requestChat,
  acceptTicket,
  closeTicket 
} from '../controllers/supportController.js';
import { handleAiChat } from '../controllers/aiSupportController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { supportLimiter, aiChatLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public route for the AI safety co-pilot (so prospective clients & guest users can ask queries)
router.post('/ai-chat', aiChatLimiter, handleAiChat);

router.use(protect);

router.get('/my-ticket', getMyTicket);
router.post('/request', supportLimiter, requestChat);
router.put('/tickets/:ticketId/accept', adminOnly, acceptTicket);
router.put('/tickets/:ticketId/close', closeTicket);
router.get('/tickets', adminOnly, getTickets);
router.get('/tickets/:ticketId/messages', getMessages);

export default router;
