/**
 * ============================================================
 * FILE: models/Category.js
 * PURPOSE: Defines the MongoDB schema for product categories.
 *          Supports parent-child category hierarchy for mega-menu
 *          and nested category filtering in the product listing page.
 *
 * CATEGORY EXAMPLES:
 *  Parent: "Fire Extinguishers"
 *  Children: "CO2 Extinguishers", "Foam Extinguishers", "Dry Powder"
 *
 * USED BY: categoryController.js, Product model (ref)
 * ============================================================
 */

import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    // ── Category Name ──────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },

    // ── SEO-Friendly URL Slug ──────────────────────────────
    // Generated from name. e.g., "Fire Extinguishers" → "fire-extinguishers"
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    // ── Category Description ───────────────────────────────
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },

    // ── Category Image ─────────────────────────────────────
    // Displayed in the categories grid on the homepage
    image: {
      url: { type: String, default: '' },        // Cloudinary URL
      public_id: { type: String, default: '' },  // For image deletion
    },

    // ── Parent Category (for sub-categories) ──────────────
    // If null, this is a top-level/root category.
    // If set, this is a sub-category under the parent.
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',   // Self-referencing for hierarchical structure
      default: null,
    },

    // ── Display Order ──────────────────────────────────────
    // Controls the order categories appear in navigation and listing
    order: {
      type: Number,
      default: 0,
    },

    // ── Visibility ─────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,    // Inactive categories are hidden from users but not deleted
    },

    // ── Icon (optional for UI) ─────────────────────────────
    // Icon name from Lucide React or custom SVG identifier
    icon: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,           // createdAt, updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Virtual: productCount
 * ----------------------
 * Virtual field that would show how many products belong to this category.
 * NOTE: This is populated by the controller using aggregation, not stored in DB.
 */
categorySchema.virtual('productCount');

// Index on slug for fast URL lookups


// Index on parent for fast sub-category queries
categorySchema.index({ parent: 1 });

const Category = mongoose.model('Category', categorySchema);

export default Category;
