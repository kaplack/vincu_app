const { verifyAccessToken } = require("../utils/jwt");
const { sequelize } = require("../config/db");
const { HttpError } = require("../utils/httpError");

async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      throw new HttpError(401, "Missing or invalid Authorization header.", "AUTH_NO_TOKEN");
    }

    const payload = verifyAccessToken(token);

    const user = await sequelize.models.User.findByPk(payload.sub);
    if (!user) throw new HttpError(401, "User not found.", "AUTH_USER_NOT_FOUND");

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAuth };
