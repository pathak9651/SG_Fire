import express from 'express';
import { 
  getMyTicket, 
  getTickets, 
  getMessages,
  requestChat,
  acceptTicket,
  closeTicket 
} from '../controllers/supportController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { supportLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(protect);

router.get('/my-ticket', getMyTicket);
router.post('/request', supportLimiter, requestChat);
router.put('/tickets/:ticketId/accept', adminOnly, acceptTicket);
router.put('/tickets/:ticketId/close', closeTicket);
router.get('/tickets', adminOnly, getTickets);
router.get('/tickets/:ticketId/messages', getMessages);

export default router;
