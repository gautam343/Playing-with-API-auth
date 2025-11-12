const jwt = require('jsonwebtoken');
const basicAuth = require('../middleware/basicAuth');

const SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    try {
      const payload = jwt.verify(token, SECRET);
      req.user = payload;
      return next();
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }
  return basicAuth(req, res, next);
};
