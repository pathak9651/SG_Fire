import express from 'express';
import { toggleWishlist, getWishlist, updateProfile, updatePassword } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All user routes require authentication
router.use(protect);

router.route('/profile').put(updateProfile);
router.route('/password').put(updatePassword);

router.route('/wishlist').get(getWishlist);
router.route('/wishlist/:productId').post(toggleWishlist);

export default router;
