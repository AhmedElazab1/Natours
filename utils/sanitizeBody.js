const sanitizeHtml = require('sanitize-html');

/**
 * Sanitize all string fields inside req.body deeply (including nested objects)
 */
function deepSanitize(obj) {
  if (typeof obj === 'string') {
    return sanitizeHtml(obj, {
      allowedTags: [],
      allowedAttributes: {},
    });
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepSanitize(item));
  }

  if (typeof obj === 'object' && obj !== null) {
    const cleanedObj = {};
    Object.keys(obj).forEach((key) => {
      cleanedObj[key] = deepSanitize(obj[key]);
    });
    return cleanedObj;
  }

  return obj; // numbers, booleans, null
}

module.exports = function sanitizeBody(req, res, next) {
  if (req.body) {
    req.body = deepSanitize(req.body);
  }
  next();
};
