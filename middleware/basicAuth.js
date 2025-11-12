const envUser = process.env.AUTH_USER || 'admin';
const envPass = process.env.AUTH_PASS || 'admin123';

module.exports = function (req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Employee API"');
    return res.status(401).json({ error: 'Authentication required' });
  }

  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Basic') return res.status(400).json({ error: 'Bad Authorization header' });

  const buf = Buffer.from(parts[1], 'base64');
  const [user, pass] = buf.toString().split(':');

  if (user === envUser && pass === envPass) return next();

  res.setHeader('WWW-Authenticate', 'Basic realm="Employee API"');
  return res.status(401).json({ error: 'Invalid credentials' });
};
