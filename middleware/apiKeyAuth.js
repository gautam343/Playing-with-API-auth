// middleware/apiKeyAuth.js
const VALID_KEYS = new Set([
  process.env.API_KEY || 'my-secret-api-key'
]);

module.exports = (req, res, next) => {
  const headerKey = req.header('x-api-key');
  const queryKey = req.query.api_key;
  const authHeader = req.header('authorization') || '';

  const key =
    headerKey ||
    queryKey ||
    (authHeader.startsWith('ApiKey ') ? authHeader.slice(7).trim() : null);

  if (!key || !VALID_KEYS.has(key)) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }

  next();
};
