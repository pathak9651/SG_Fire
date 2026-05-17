import express from 'express';
import { getMyTicket, getTickets, getMessages } from '../controllers/supportController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/my-ticket', getMyTicket);
router.get('/tickets', adminOnly, getTickets);
router.get('/tickets/:ticketId/messages', getMessages);

export default router;
