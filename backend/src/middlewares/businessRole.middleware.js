// src/middlewares/businessRole.middleware.js
const { HttpError } = require("../utils/httpError");
const { BUSINESS_ROLES } = require("../constants/businessRoles");

/**
 * Usage:
 *   requireBusinessRole([BUSINESS_ROLES.OWNER, BUSINESS_ROLES.MANAGER])
 *
 * Requires: requireBusinessMember must run before (sets req.membership)
 */
function requireBusinessRole(allowedRoles = []) {
  return (req, _res, next) => {
    try {
      if (!req.user) throw new HttpError(401, "Unauthorized.", "AUTH_REQUIRED");

      const role = req.membership?.role;
      if (!role) {
        throw new HttpError(
          403,
          "Business membership required.",
          "BUSINESS_NOT_MEMBER",
        );
      }

      if (!allowedRoles.includes(role)) {
        throw new HttpError(
          403,
          "Insufficient role.",
          "BUSINESS_ROLE_FORBIDDEN",
          {
            allowedRoles,
            role,
          },
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { requireBusinessRole, BUSINESS_ROLES };
