// backend/src/middlewares/businessAccess.middleware.js
const { sequelize } = require("../config/db");
const { HttpError } = require("../utils/httpError");
const { BUSINESS_ROLES } = require("../constants/businessRoles");
const { MEMBERSHIP_STATUS } = require("../constants/membershipStatus");

function isSuperAdmin(user) {
  // Según tu regla: user.role = USER | SUPERADMIN
  return String(user?.role || "").toUpperCase() === "SUPERADMIN";
}

async function requireBusinessMember(req, _res, next) {
  try {
    const businessId = req.user?.currentBusinessId || {};
    //console.log("requireBusinessMember middleware - businessId:", req.params);

    if (!req.user) throw new HttpError(401, "Unauthorized.", "AUTH_REQUIRED");
    if (isSuperAdmin(req.user)) return next();

    const Business = sequelize.models.Business;
    const BusinessUser = sequelize.models.BusinessUser;

    const biz = await Business.findByPk(businessId);
    if (!biz) {
      throw new HttpError(404, "Business not found.", "BUSINESS_NOT_FOUND");
    }

    // If it's a branch, permissions come from principal
    const principalId = biz.parentId ? biz.parentId : biz.id;

    const membership = await BusinessUser.findOne({
      where: {
        businessId: principalId,
        userId: req.user.id,
        status: MEMBERSHIP_STATUS.ACTIVE,
      },
    });

    if (!membership) {
      throw new HttpError(
        403,
        "Not a member of this business.",
        "BUSINESS_NOT_MEMBER",
      );
    }

    // ✅ útil guardar el principalId para el resto del pipeline (opcional)
    req.principalBusinessId = principalId;
    req.membership = membership;

    next();
  } catch (err) {
    next(err);
  }
}

async function requireBusinessOwner(req, _res, next) {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized.", "AUTH_REQUIRED");
    if (isSuperAdmin(req.user)) return next();

    // requireBusinessMember debe correr antes y setear req.membership
    const role = req.membership?.role;
    if (role !== BUSINESS_ROLES.OWNER) {
      throw new HttpError(
        403,
        "Owner role required.",
        "BUSINESS_OWNER_REQUIRED",
      );
    }

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireBusinessMember, requireBusinessOwner };
