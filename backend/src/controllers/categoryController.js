import Category from '../models/Category.js';
import { asyncHandler, ErrorResponse } from '../middleware/errorHandler.js';
import { createSlug } from '../utils/slugify.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort('order name');
  res.json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ErrorResponse('Category not found', 404);
  res.json({ success: true, data: category });
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private (Admin)
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, parent, order, icon } = req.body;
  
  const slug = createSlug(name);
  
  const category = await Category.create({
    name,
    slug,
    description,
    parent,
    order,
    icon
  });
  
  res.status(201).json({ success: true, data: category });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
export const updateCategory = asyncHandler(async (req, res) => {
  let category = await Category.findById(req.params.id);
  if (!category) throw new ErrorResponse('Category not found', 404);
  
  if (req.body.name) {
    req.body.slug = createSlug(req.body.name);
  }
  
  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.json({ success: true, data: category });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ErrorResponse('Category not found', 404);
  
  await category.deleteOne();
  res.json({ success: true, message: 'Category removed' });
});
