/**
 * ============================================================
 * FILE: models/Product.js
 * PURPOSE: Defines the MongoDB schema for fire safety products.
 *          The most complex model in the application, covering:
 *          - Product identification (title, slug, SKU)
 *          - Pricing (original price, discounted price, tax)
 *          - Inventory (stock, threshold alerts)
 *          - Media (multiple images via Cloudinary)
 *          - Categorization (category, brand, tags)
 *          - Technical specifications (key-value pairs)
 *          - Customer reviews and ratings (embedded documents)
 *          - SEO metadata (meta title, description)
 *
 * USED BY: productController.js, cartController.js, orderController.js
 * ============================================================
 */

import mongoose from 'mongoose';

/**
 * reviewSchema
 * ------------
 * Sub-document for individual product reviews.
 * Embedded directly in the Product document for fast reads.
 * (Alternatively stored in a separate Review model for admin approval workflow)
 */
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true },    // User's name at time of review (cached)
    avatar: { type: String },                  // User avatar URL (cached)
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      maxlength: [1000, 'Review cannot exceed 1000 characters'],
    },
    isApproved: {
      type: Boolean,
      default: false,   // Reviews require admin approval before public display
    },
    helpfulVotes: {
      type: Number,
      default: 0,       // Count of users who marked this review as helpful
    },
  },
  { timestamps: true }
);

/**
 * specificationSchema
 * -------------------
 * Sub-document for a single product specification (key-value pair).
 * E.g., { key: 'Capacity', value: '4 KG' }
 *       { key: 'ISI Certified', value: 'Yes' }
 */
const specificationSchema = new mongoose.Schema({
  key: { type: String, required: true },    // Specification name
  value: { type: String, required: true },  // Specification value
});

/**
 * productSchema
 * -------------
 * Main Product document schema.
 */
const productSchema = new mongoose.Schema(
  {
    // ── Identification ─────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      // Auto-generated from title in the controller before saving
    },

    sku: {
      type: String,
      unique: true,
      sparse: true,   // sparse: allow multiple null values (sku is optional)
    },

    // ── Description & Content ──────────────────────────────
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },

    shortDescription: {
      type: String,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
      // Displayed in product cards (keeps cards clean)
    },

    // ── Categorization ─────────────────────────────────────
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },

    brand: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
    },

    tags: [String],    // e.g., ['ISI certified', 'home use', 'office']

    // ── Pricing ────────────────────────────────────────────
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },

    discountPrice: {
      type: Number,
      min: [0, 'Discount price cannot be negative'],
      // If set, this is the actual selling price. 'price' becomes the MRP.
      validate: {
        validator: function (val) {
          // Discount price must be less than original price
          return val < this.price;
        },
        message: 'Discount price must be lower than the original price',
      },
    },

    taxRate: {
      type: Number,
      default: 18,    // GST percentage (default 18% for fire safety equipment)
      min: 0,
      max: 100,
    },

    // ── Inventory / Stock Management ───────────────────────
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },

    lowStockThreshold: {
      type: Number,
      default: 10,    // Admin alert when stock falls below this number
    },

    // ── Images ─────────────────────────────────────────────
    // Array of image objects from Cloudinary
    images: [
      {
        url: { type: String, required: true },         // Image URL or Base64 data
        public_id: { type: String },                   // For future deletion (optional if stored in DB)
        alt: { type: String, default: '' },            // Alt text for accessibility/SEO
      },
    ],

    // ── Technical Specifications ───────────────────────────
    specifications: [specificationSchema],   // Array of key-value spec pairs

    // ── Ratings & Reviews ──────────────────────────────────
    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      // This is the calculated AVERAGE rating (updated by updateProductRating())
    },

    numReviews: {
      type: Number,
      default: 0,   // Cached count of approved reviews (for display in product cards)
    },

    reviews: [reviewSchema],  // Embedded review sub-documents

    // ── Product Status & Features ──────────────────────────
    isFeatured: {
      type: Boolean,
      default: false,    // Featured products appear on homepage
    },

    isActive: {
      type: Boolean,
      default: true,     // Inactive products are hidden from users
    },

    isBestSeller: {
      type: Boolean,
      default: false,   // Badge for best-selling products
    },

    isNewArrival: {
      type: Boolean,
      default: false,   // Badge for newly added products
    },

    // ── SEO Metadata ───────────────────────────────────────
    // Overrides the default SEO tags for this specific product page
    metaTitle: {
      type: String,
      maxlength: [70, 'Meta title should not exceed 70 characters'],
    },

    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description should not exceed 160 characters'],
    },

    // ── Sales Tracking ─────────────────────────────────────
    totalSold: {
      type: Number,
      default: 0,   // Incremented each time this product is ordered
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─────────────────────────────────────────────
// VIRTUAL FIELDS
// Computed on-the-fly, not stored in MongoDB
// ─────────────────────────────────────────────

/**
 * Virtual: discountPercentage
 * ---------------------------
 * Calculates what percentage off the original price the discount represents.
 * E.g., price=1000, discountPrice=750 → discountPercentage=25
 */
productSchema.virtual('discountPercentage').get(function () {
  if (this.discountPrice && this.price > 0) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

/**
 * Virtual: effectivePrice
 * -----------------------
 * Returns the price the customer actually pays.
 * Uses discountPrice if available, otherwise uses price.
 */
productSchema.virtual('effectivePrice').get(function () {
  return this.discountPrice || this.price;
});

/**
 * Virtual: inStock
 * ----------------
 * Returns true if stock > 0. Used for "Add to Cart" button availability.
 */
productSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

/**
 * Virtual: isLowStock
 * -------------------
 * Returns true when stock is low (admin warning indicator).
 */
productSchema.virtual('isLowStock').get(function () {
  return this.stock > 0 && this.stock <= this.lowStockThreshold;
});

// ─────────────────────────────────────────────
// INSTANCE METHODS
// ─────────────────────────────────────────────

/**
 * updateProductRatings()
 * ----------------------
 * Recalculates and updates the average rating and review count
 * based on all APPROVED reviews.
 * Should be called after any review is added, edited, or deleted.
 */
productSchema.methods.updateProductRatings = function () {
  const approvedReviews = this.reviews.filter((r) => r.isApproved);

  if (approvedReviews.length === 0) {
    this.ratings = 0;
    this.numReviews = 0;
  } else {
    const totalRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
    this.ratings = Math.round((totalRating / approvedReviews.length) * 10) / 10; // 1 decimal
    this.numReviews = approvedReviews.length;
  }
};

// ─────────────────────────────────────────────
// INDEXES (for performance)
// ─────────────────────────────────────────────

productSchema.index({ category: 1 });          // Fast category filtering
productSchema.index({ brand: 1 });             // Fast brand filtering
productSchema.index({ price: 1 });             // Fast price range queries
productSchema.index({ ratings: -1 });          // Fast sort by rating
productSchema.index({ totalSold: -1 });        // Fast best-sellers query
productSchema.index({ isFeatured: 1 });        // Fast featured products query
productSchema.index({ createdAt: -1 });        // Fast new arrivals query

// Text index for keyword search across title and description
productSchema.index({ title: 'text', description: 'text', brand: 'text', tags: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;
