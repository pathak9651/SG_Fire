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
import { uploadToCloudinary, deleteFromCloudinary } from '../middleware/upload.js';

// ─────────────────────────────────────────────
// @desc    Get all products with search, filter, sort, pagination
// @route   GET /api/products
// @access  Public
// Query params: keyword, category, brand, price[gte], price[lte],
//               ratings[gte], sort, page, limit, fields
// ─────────────────────────────────────────────
export const getProducts = asyncHandler(async (req, res) => {
  // Count total matching documents (for pagination metadata)
  const totalQuery = new ApiFeatures(Product.find({ isActive: true }), req.query)
    .search()
    .filter();

  const totalProducts = await totalQuery.query.countDocuments();

  // Fetch the paginated/sorted/filtered results
  const features = new ApiFeatures(
    Product.find({ isActive: true }).populate('category', 'name slug'),
    req.query
  )
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const products = await features.query;

  // Calculate pagination metadata for the frontend
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
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
  } = req.body;

  // Validate that the category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) throw new ErrorResponse('Category not found.', 404);

  // Generate URL slug from title
  const baseSlug = createSlug(title);
  const slug = await ensureUniqueSlug(baseSlug, Product);

  // Upload all product images to Cloudinary
  // req.files is set by the uploadMultiple middleware
  const imageUploads = req.files
    ? await Promise.all(
        req.files.map((file) =>
          uploadToCloudinary(file.buffer, 'sgfire/products')
        )
      )
    : [];

  const images = imageUploads.map((result) => ({
    url: result.url,
    public_id: result.public_id,
    alt: title, // Use product title as alt text for SEO
  }));

  // Parse specifications if sent as JSON string
  const parsedSpecs =
    typeof specifications === 'string' ? JSON.parse(specifications) : specifications;

  const product = await Product.create({
    title, slug, description, shortDescription,
    category, brand, price, discountPrice, stock,
    specifications: parsedSpecs, tags, taxRate, lowStockThreshold,
    isFeatured, isNewArrival, images, metaTitle, metaDescription,
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

  // If new images are uploaded, upload to Cloudinary
  if (req.files && req.files.length > 0) {
    // Delete old images from Cloudinary (prevent storage bloat)
    await Promise.all(
      product.images.map((img) => deleteFromCloudinary(img.public_id))
    );

    // Upload new images
    const imageUploads = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.buffer, 'sgfire/products'))
    );
    req.body.images = imageUploads.map((r) => ({
      url: r.url,
      public_id: r.public_id,
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

  // Soft delete: mark as inactive instead of removing from DB
  // This preserves order history references to this product
  product.isActive = false;
  await product.save();

  res.json({ success: true, message: 'Product removed successfully.' });
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
