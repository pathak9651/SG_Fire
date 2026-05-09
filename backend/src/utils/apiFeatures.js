/**
 * ============================================================
 * FILE: utils/apiFeatures.js
 * PURPOSE: Reusable utility class for MongoDB query operations.
 *          Provides chainable methods for Search, Filter, Sort,
 *          Field Selection, and Pagination on any Mongoose model.
 *
 * WHY A CLASS?
 * - Avoids repeating the same filter/sort/paginate logic in
 *   every product/order/appointment controller.
 * - Chainable methods allow clean, readable query building.
 *
 * USAGE in a controller:
 *   const features = new ApiFeatures(Product.find(), req.query)
 *     .search()      // apply keyword search
 *     .filter()      // apply category/price/brand filters
 *     .sort()        // apply sort order
 *     .limitFields() // select only needed fields
 *     .paginate();   // apply page & limit
 *   const products = await features.query;
 * ============================================================
 */

class ApiFeatures {
  /**
   * @param {mongoose.Query} query   - Mongoose query object (e.g., Product.find())
   * @param {Object}         queryStr - req.query from Express (URL parameters)
   */
  constructor(query, queryStr) {
    this.query = query;       // The live Mongoose query to be modified
    this.queryStr = queryStr; // The raw query string parameters from the URL
  }

  /**
   * search()
   * --------
   * Applies a keyword search on the 'title' and 'description' fields
   * using a case-insensitive regex. This allows partial matches.
   *
   * URL Example: /api/products?keyword=extinguisher
   *
   * @returns {ApiFeatures} this — for method chaining
   */
  search() {
    const keyword = this.queryStr.keyword
      ? {
          $or: [
            // Search in product title (case insensitive)
            { title: { $regex: this.queryStr.keyword, $options: 'i' } },
            // Also search in description for broader results
            { description: { $regex: this.queryStr.keyword, $options: 'i' } },
          ],
        }
      : {}; // No keyword → return all documents

    this.query = this.query.find({ ...keyword });
    return this; // Return 'this' for chaining
  }

  /**
   * filter()
   * --------
   * Applies field-level filters from query parameters.
   * Supports MongoDB comparison operators: gte, gt, lte, lt.
   * Automatically excludes non-filter query params (keyword, page, sort, limit, fields).
   *
   * URL Examples:
   *   /api/products?category=extinguishers
   *   /api/products?price[gte]=500&price[lte]=5000
   *   /api/products?brand=Kanex&ratings[gte]=4
   *
   * @returns {ApiFeatures} this — for method chaining
   */
  filter() {
    // Clone the query string object to avoid mutating the original
    const queryCopy = { ...this.queryStr };

    // Remove fields that are NOT filters — they are used elsewhere
    const removeFields = ['keyword', 'page', 'sort', 'limit', 'fields'];
    removeFields.forEach((key) => delete queryCopy[key]);

    // Convert comparison operators to MongoDB syntax
    // URL sends: price[gte]=500 → JS gives: { price: { gte: '500' } }
    // We need:   { price: { $gte: 500 } }
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  /**
   * sort()
   * ------
   * Applies sorting to the query. Supports multiple sort fields.
   * Default sort: newest first (by createdAt descending).
   *
   * URL Examples:
   *   /api/products?sort=price         → sort by price ascending
   *   /api/products?sort=-price        → sort by price descending
   *   /api/products?sort=-ratings,price → sort by rating desc, then price asc
   *
   * @returns {ApiFeatures} this — for method chaining
   */
  sort() {
    if (this.queryStr.sort) {
      // URL uses comma-separated fields; Mongoose needs space-separated
      const sortBy = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // Default: show newest products first
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  /**
   * limitFields()
   * -------------
   * Selects only specific fields from documents (field projection).
   * Reduces response payload size and avoids sending sensitive data.
   * Always excludes __v (MongoDB version key).
   *
   * URL Example: /api/products?fields=title,price,images
   *
   * @returns {ApiFeatures} this — for method chaining
   */
  limitFields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      // Always exclude the internal MongoDB version key
      this.query = this.query.select('-__v');
    }
    return this;
  }

  /**
   * paginate()
   * ----------
   * Applies pagination using 'page' and 'limit' query params.
   * Skips the correct number of documents for the requested page.
   *
   * URL Examples:
   *   /api/products?page=2&limit=12   → page 2, 12 products per page
   *   /api/products?page=1            → page 1, 10 products (default limit)
   *
   * @returns {ApiFeatures} this — for method chaining
   */
  paginate() {
    const page = parseInt(this.queryStr.page, 10) || 1;    // Default: page 1
    const limit = parseInt(this.queryStr.limit, 10) || 10; // Default: 10 per page
    const skip = (page - 1) * limit; // Calculate how many docs to skip

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

export default ApiFeatures;
