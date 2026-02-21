// backend/src/config/env.js

function parseOrigins(value) {
  if (!value) return ["http://localhost:5173"];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const allowedOrigins = parseOrigins(process.env.CORS_ORIGIN);

const corsOptions = {
  origin(origin, callback) {
    // allow curl/postman (no origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

module.exports = { corsOptions };
