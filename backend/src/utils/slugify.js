/**
 * ============================================================
 * FILE: utils/slugify.js
 * PURPOSE: Converts a human-readable string (like a product title
 *          or category name) into a URL-friendly "slug".
 *
 * WHY SLUGS?
 * - SEO-friendly URLs: /products/abc-fire-extinguisher instead of
 *   /products/64a3f2b1c9e1234567890abc (MongoDB ObjectId)
 * - More readable and shareable links for users
 * - Better indexing by search engines
 *
 * EXAMPLES:
 *   "ABC Fire Extinguisher 4KG" → "abc-fire-extinguisher-4kg"
 *   "Smoke Detectors & Alarms!" → "smoke-detectors-alarms"
 *   "  Fire  Safety  Helmet  " → "fire-safety-helmet"
 *
 * USAGE:
 *   import { createSlug, ensureUniqueSlug } from '../utils/slugify.js';
 *   const slug = createSlug('ABC Fire Extinguisher 4KG');
 * ============================================================
 */

/**
 * createSlug()
 * ------------
 * Converts a string to a lowercase, hyphen-separated URL slug.
 * Removes all special characters except hyphens.
 *
 * @param {string} text - The text to convert (e.g., product title)
 * @returns {string} A URL-safe slug string
 */
export const createSlug = (text) => {
  return text
    .toString()           // Ensure input is a string
    .toLowerCase()        // Convert to lowercase for consistency
    .trim()               // Remove leading/trailing whitespace
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '')     // Remove all non-word characters (special chars)
    .replace(/\-\-+/g, '-')       // Replace multiple consecutive hyphens with single
    .replace(/^-+/, '')           // Remove leading hyphens
    .replace(/-+$/, '');          // Remove trailing hyphens
};

/**
 * ensureUniqueSlug()
 * ------------------
 * Generates a unique slug by appending a number suffix if the base slug
 * already exists in the database. Prevents duplicate slug collisions.
 *
 * EXAMPLE: If "abc-extinguisher" exists, generates "abc-extinguisher-2"
 *
 * @param {string}           baseSlug  - The initial slug to check
 * @param {mongoose.Model}   Model     - The Mongoose model to query against
 * @param {string|null}      excludeId - Optional: exclude this document ID from check
 *                                       (used when updating an existing document)
 * @returns {Promise<string>} A unique slug string
 */
export const ensureUniqueSlug = async (baseSlug, Model, excludeId = null) => {
  let slug = baseSlug;
  let counter = 1;

  // Keep checking until we find a slug that doesn't exist
  while (true) {
    // Build query to find existing document with this slug
    const query = { slug };

    // Exclude the current document when updating (so it doesn't conflict with itself)
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existingDoc = await Model.findOne(query);

    if (!existingDoc) {
      // Slug is unique, return it
      return slug;
    }

    // Slug exists — append a counter and try again
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
};
