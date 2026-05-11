import express from 'express';
import { toggleWishlist, getWishlist } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All user routes require authentication
router.use(protect);

router.route('/wishlist').get(getWishlist);
router.route('/wishlist/:productId').post(toggleWishlist);

export default router;
