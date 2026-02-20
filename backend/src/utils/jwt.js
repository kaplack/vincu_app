const jwt = require("jsonwebtoken");
const { HttpError } = require("./httpError");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function signAccessToken({ sub, role }) {
  return jwt.sign({ role }, JWT_SECRET, { subject: sub, expiresIn: JWT_EXPIRES_IN });
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (_err) {
    throw new HttpError(401, "Invalid or expired token.", "AUTH_INVALID_TOKEN");
  }
}

module.exports = { signAccessToken, verifyAccessToken };
