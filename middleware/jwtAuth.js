// middleware/jwtAuth.js
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

module.exports = function (req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Authorization header. Use: Authorization: Bearer <token>' });
  }
  const token = auth.slice(7).trim();
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload; // attach token payload (e.g., username) to request
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
