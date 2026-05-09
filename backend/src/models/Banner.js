/**
 * ============================================================
 * FILE: models/Banner.js
 * PURPOSE: Stores homepage banners, promotional sliders, and
 *          seasonal advertisements managed by admin.
 * POSITIONS: hero (main slider), mid_page (section banners), popup
 * USED BY: adminController.js, home page API
 * ============================================================
 */

import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    // Banner heading shown over the image
    title: { type: String, required: [true, 'Banner title is required'], trim: true },

    // Subtitle text shown under the title
    subtitle: { type: String, trim: true },

    // CTA button text (e.g., "Shop Now", "Book Service")
    buttonText: { type: String, default: 'Shop Now' },

    // URL the banner links to when clicked
    linkUrl: { type: String, default: '/' },

    // Cloudinary banner image details
    image: {
      url: { type: String, required: [true, 'Banner image is required'] },
      public_id: { type: String, required: true },
      alt: { type: String, default: 'SG Fire Banner' },
    },

    // Banner placement on the website
    position: {
      type: String,
      enum: ['hero', 'mid_page', 'popup', 'sidebar'],
      default: 'hero',
    },

    // Display order (lower number = shown first in slider)
    order: { type: Number, default: 0 },

    // Toggle visibility without deleting
    isActive: { type: Boolean, default: true },

    // Optional validity window (e.g., for seasonal offers)
    startDate: { type: Date },
    endDate: { type: Date },

    // Background color override (for text-overlay banners)
    bgColor: { type: String, default: '#000000' },

    // Text color (light or dark depending on banner image)
    textColor: { type: String, enum: ['light', 'dark'], default: 'light' },
  },
  { timestamps: true }
);

bannerSchema.index({ position: 1, isActive: 1, order: 1 }); // Fast active banner fetch

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;
