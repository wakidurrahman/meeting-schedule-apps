const jwt = require('jsonwebtoken');
const { MESSAGES } = require('../constants/messages');

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
