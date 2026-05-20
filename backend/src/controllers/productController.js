/**
 * ============================================================
 * FILE: controllers/productController.js
 * PURPOSE: Handles all product-related business logic.
 *          Supports browsing (public) and CRUD operations (admin).
 *
 * ROUTES (defined in routes/product.routes.js):
 *  GET    /api/products              - Get all products (with search/filter/sort/paginate)
 *  GET    /api/products/featured     - Get featured products for homepage
 *  GET    /api/products/:slug        - Get single product by slug
 *  POST   /api/products              - Create product (admin only)
 *  PUT    /api/products/:id          - Update product (admin only)
 *  DELETE /api/products/:id          - Delete product (admin only)
 *  PATCH  /api/products/:id/stock    - Update stock only (admin only)
 *  GET    /api/products/related/:id  - Get related products
 * ============================================================
 */

import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { asyncHandler, ErrorResponse } from '../middleware/errorHandler.js';
import ApiFeatures from '../utils/apiFeatures.js';
import { createSlug, ensureUniqueSlug } from '../utils/slugify.js';
import { bufferToBase64, deleteFromCloudinary } from '../middleware/upload.js';

// ─────────────────────────────────────────────
// @desc    Get all products with search, filter, sort, pagination
// @route   GET /api/products
// @access  Public
// Query params: keyword, category, brand, price[gte], price[lte],
//               ratings[gte], sort, page, limit, fields
// ─────────────────────────────────────────────
export const getProducts = asyncHandler(async (req, res) => {
  // Clone query to a local mutable object to bypass Express's read-only/proxy query object restriction
  const queryObj = { ...req.query };

  // If category filter is passed, check if it's a slug or ObjectId
  if (queryObj.category) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(queryObj.category);
    if (!isObjectId) {
      const categoryDoc = await Category.findOne({ slug: queryObj.category });
      if (categoryDoc) {
        queryObj.category = categoryDoc._id.toString();
      } else {
        // If not found, use a non-existent ObjectId to return 0 results
        queryObj.category = '000000000000000000000000';
      }
    }
  }

  // Count total matching documents (for pagination metadata)
  const totalQuery = new ApiFeatures(Product.find(), queryObj)
    .search()
    .filter();

  const totalProducts = await totalQuery.query.countDocuments();

  // Fetch the paginated/sorted/filtered results
  const features = new ApiFeatures(
    Product.find().populate('category', 'name slug'),
    queryObj
  )
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const products = await features.query;

  // Calculate pagination metadata for the frontend
  const page = parseInt(queryObj.page, 10) || 1;
  const limit = parseInt(queryObj.limit, 10) || 10;
  const totalPages = Math.ceil(totalProducts / limit);

  res.json({
    success: true,
    count: products.length,
    totalProducts,
    totalPages,
    currentPage: page,
    data: products,
  });
});

// ─────────────────────────────────────────────
// @desc    Get featured products for homepage
// @route   GET /api/products/featured
// @access  Public
// ─────────────────────────────────────────────
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 8; // Default 8 for homepage grid

  const products = await Product.find({ isFeatured: true, isActive: true })
    .populate('category', 'name slug')
    .sort('-createdAt')
    .limit(limit)
    .select('title slug images price discountPrice ratings numReviews isBestSeller isNewArrival brand stock');

  res.json({ success: true, count: products.length, data: products });
});

// ─────────────────────────────────────────────
// @desc    Get single product by URL slug
// @route   GET /api/products/:slug
// @access  Public
// ─────────────────────────────────────────────
export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true })
    .populate('category', 'name slug')
    // Only return approved reviews with user names
    .populate({
      path: 'reviews.user',
      select: 'name avatar',
    });

  if (!product) {
    throw new ErrorResponse('Product not found.', 404);
  }

  res.json({ success: true, data: product });
});

// ─────────────────────────────────────────────
// @desc    Get related products (same category, different product)
// @route   GET /api/products/related/:id
// @access  Public
// ─────────────────────────────────────────────
export const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ErrorResponse('Product not found.', 404);

  // Find other products in the same category, excluding the current one
  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },    // $ne = not equal to current product
    isActive: true,
  })
    .limit(6)
    .select('title slug images price discountPrice ratings numReviews brand');

  res.json({ success: true, count: related.length, data: related });
});

// ─────────────────────────────────────────────
// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Admin only)
// ─────────────────────────────────────────────
export const createProduct = asyncHandler(async (req, res) => {
  const {
    title, description, shortDescription, category, brand,
    price, discountPrice, stock, specifications, tags,
    taxRate, lowStockThreshold, isFeatured, isNewArrival, metaTitle, metaDescription,
    isActive,
  } = req.body;

  // Validate that the category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) throw new ErrorResponse('Category not found.', 404);

  // Generate URL slug from title
  const baseSlug = createSlug(title);
  const slug = await ensureUniqueSlug(baseSlug, Product);

  // Convert all product images to Base64 for MongoDB storage
  const images = req.files
    ? req.files.map((file) => ({
        url: bufferToBase64(file),
        alt: title,
      }))
    : [];

  // Parse specifications if sent as JSON string
  const parsedSpecs =
    typeof specifications === 'string' ? JSON.parse(specifications) : specifications;

  const product = await Product.create({
    title, slug, description, shortDescription,
    category, brand, price, discountPrice, stock,
    specifications: parsedSpecs, tags, taxRate, lowStockThreshold,
    isFeatured, isNewArrival, images, metaTitle, metaDescription,
    isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : true,
  });

  res.status(201).json({ success: true, data: product });
});

// ─────────────────────────────────────────────
// @desc    Update an existing product
// @route   PUT /api/products/:id
// @access  Private (Admin only)
// ─────────────────────────────────────────────
export const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) throw new ErrorResponse('Product not found.', 404);

  // If new images are uploaded, convert to Base64
  if (req.files && req.files.length > 0) {
    // If there were Cloudinary images before, try to delete them
    await Promise.all(
      product.images
        .filter((img) => img.public_id)
        .map((img) => deleteFromCloudinary(img.public_id))
    );

    // Convert new images to Base64
    req.body.images = req.files.map((file) => ({
      url: bufferToBase64(file),
      alt: req.body.title || product.title,
    }));
  }

  // If title changed, regenerate slug
  if (req.body.title && req.body.title !== product.title) {
    const baseSlug = createSlug(req.body.title);
    req.body.slug = await ensureUniqueSlug(baseSlug, Product, product._id);
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,           // Return the updated document
    runValidators: true, // Run schema validators on updated fields
  });

  res.json({ success: true, data: product });
});

// ─────────────────────────────────────────────
// @desc    Delete a product (soft delete by setting isActive: false)
// @route   DELETE /api/products/:id
// @access  Private (Admin only)
// ─────────────────────────────────────────────
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ErrorResponse('Product not found.', 404);

  // Hard delete: remove the product from the database as requested
  // Note: For production, ensure no order references exist before hard deleting
  await product.deleteOne();

  res.json({ success: true, message: 'Product deleted successfully from database.' });
});

// ─────────────────────────────────────────────
// @desc    Update product stock only
// @route   PATCH /api/products/:id/stock
// @access  Private (Admin only)
// ─────────────────────────────────────────────
export const updateStock = asyncHandler(async (req, res) => {
  const { stock } = req.body;

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { stock },
    { new: true, runValidators: true }
  );

  if (!product) throw new ErrorResponse('Product not found.', 404);

  res.json({ success: true, data: { stock: product.stock } });
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug');
  if (!product) throw new ErrorResponse('Product not found.', 404);
  res.json({ success: true, data: product });
});