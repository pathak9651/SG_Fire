/**
 * ============================================================
 * FILE: models/Review.js
 * PURPOSE: Standalone Review model for admin approval workflow.
 *          Reviews are stored here AND embedded in Product.reviews.
 *          This allows admin to manage/approve reviews independently
 *          before they appear publicly on product pages.
 *
 * WORKFLOW:
 *  1. User submits review → saved here with isApproved: false
 *  2. Admin approves → review added to Product.reviews[]
 *  3. Product.updateProductRatings() recalculates average rating
 *
 * USED BY: reviewController.js, adminController.js
 * ============================================================
 */

import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    // User who wrote the review
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Product being reviewed
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },

    // Star rating 1–5
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },

    // Written review
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      maxlength: [1000, 'Review cannot exceed 1000 characters'],
    },

    // Review title/headline (optional)
    title: { type: String, maxlength: [100, 'Review title max 100 chars'] },

    // Uploaded review images (e.g., product in use)
    images: [
      {
        url: { type: String },
        public_id: { type: String },
      },
    ],

    // Admin approval status — false = pending, true = publicly visible
    isApproved: { type: Boolean, default: false },

    // Admin can hide a review without deleting (e.g., abusive content)
    isHidden: { type: Boolean, default: false },

    // Helpful votes from other users
    helpfulVotes: { type: Number, default: 0 },

    // Users who voted this review as helpful
    votedHelpfulBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Verified Purchase badge — true if user actually ordered this product
    isVerifiedPurchase: { type: Boolean, default: false },

    // Admin response to this review (optional)
    adminReply: {
      message: { type: String },
      repliedAt: { type: Date },
    },
  },
  { timestamps: true }
);

// Compound index: one review per user per product (enforced by unique constraint)
reviewSchema.index({ user: 1, product: 1 }, { unique: true });
reviewSchema.index({ product: 1, isApproved: 1 }); // Fast approved reviews per product
reviewSchema.index({ isApproved: 1 });              // Admin review management

const Review = mongoose.model('Review', reviewSchema);
export default Review;
