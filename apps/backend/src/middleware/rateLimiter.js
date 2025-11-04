const createRateLimiter = ({ windowMs = 60_000, max = 60 } = {}) => {
  const buckets = new Map();

  return (req, res, next) => {
    const key = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    const bucket = buckets.get(key) || { tokens: max, last: now };

    const elapsed = now - bucket.last;
    bucket.tokens = Math.min(max, bucket.tokens + (elapsed * max) / windowMs);
    bucket.last = now;

    if (bucket.tokens < 1) {
      buckets.set(key, bucket);
      res.status(429).json({ error: 'Too Many Requests' });
      return;
    }

    bucket.tokens -= 1;
    buckets.set(key, bucket);
    next();
  };
};

module.exports = { createRateLimiter };
