// auth/routes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

// POST /auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  const envUser = process.env.AUTH_USER || 'admin';
  const envPass = process.env.AUTH_PASS || 'admin123';

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }

  if (username !== envUser || password !== envPass) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const payload = { username };
  const token = jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });

  res.json({
    access_token: token,
    token_type: 'Bearer',
    expires_in: EXPIRES_IN
  });
});

module.exports = router;
