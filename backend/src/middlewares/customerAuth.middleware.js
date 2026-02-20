// backend/src/middlewares/customerAuth.middleware.js
const { HttpError } = require("../utils/httpError");
const { verifyAccessToken } = require("../utils/jwt");

function requireCustomer(req, _res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!token) {
      throw new HttpError(401, "Unauthorized.", "AUTH_REQUIRED");
    }

    const payload = verifyAccessToken(token);

    if (payload.role !== "customer") {
      throw new HttpError(403, "Forbidden.", "AUTH_FORBIDDEN");
    }

    // subject = customerId (jsonwebtoken sets it as "sub")
    req.customerId = payload.sub;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireCustomer };
