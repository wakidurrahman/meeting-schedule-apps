const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate requests using JWT tokens
 * @param {Object} req - Express request object
 * @param {Object} _res - Express response object (unused)
 * @param {Function} next - Next middleware function
 */
function authMiddleware(req, _res, next) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = payload.userId;
    } catch (_e) {
      // ignore invalid tokens but clear userId
      req.userId = null;
    }
  }
  next();
}

module.exports = { authMiddleware };
