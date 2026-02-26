const buckets = new Map();
// key: ip, value: { count, resetAt }

function rateLimitPublic({ windowMs = 60_000, max = 30 } = {}) {
  return (req, res, next) => {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip;
    const now = Date.now();

    const cur = buckets.get(ip);
    if (!cur || now > cur.resetAt) {
      buckets.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    cur.count += 1;
    if (cur.count > max) {
      return res
        .status(429)
        .json({ message: "Too many requests. Try again later." });
    }

    return next();
  };
}

module.exports = { rateLimitPublic };
