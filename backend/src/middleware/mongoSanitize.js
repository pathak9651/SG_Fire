/**
 * Custom MongoDB Sanitize Middleware
 * ---------------------------------
 * Recursively removes keys starting with '$' or containing '.'
 * from request body, query, and params to protect against NoSQL Injection attacks.
 *
 * Implemented custom because the third-party express-mongo-sanitize is incompatible
 * with Express 5's read-only request property getters. By deleting/modifying the
 * object keys in-place rather than reassigning the query/params objects, this
 * middleware remains fully compatible with Express 5.
 */

const hasForbiddenCharacters = (key) => {
  return key.startsWith('$') || key.includes('.');
};

const sanitize = (obj) => {
  if (obj && typeof obj === 'object') {
    Object.keys(obj).forEach((key) => {
      // Recurse first if value is an object/array
      if (obj[key] && typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }

      // Check if key should be sanitized
      if (hasForbiddenCharacters(key)) {
        delete obj[key];
      }
    });
  }
  return obj;
};

export const mongoSanitize = (req, res, next) => {
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  next();
};
