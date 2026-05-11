import express from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(protect, adminOnly, createCategory);

router.route('/:id')
  .get(getCategory)
  .put(protect, adminOnly, updateCategory)
  .delete(protect, adminOnly, deleteCategory);

export default router;
