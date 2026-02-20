const { sequelize } = require("../config/db");
const { MEMBERSHIP_STATUS } = require("../constants/membershipStatus");
const { HttpError } = require("../utils/httpError");

async function setCurrentBusiness(user, businessId) {
  if (!businessId) {
    user.currentBusinessId = null;
    await user.save();
    return user;
  }

  // Superadmin can set any current business (support use-case)
  if (user.role !== "SUPERADMIN") {
    const membership = await sequelize.models.BusinessUser.findOne({
      where: { businessId, userId: user.id },
    });
    if (!membership || membership.status !== MEMBERSHIP_STATUS.ACTIVE) {
      throw new HttpError(403, "You are not an active member of this business.", "USER_NOT_MEMBER");
    }
  }

  user.currentBusinessId = businessId;
  await user.save();
  return user;
}

module.exports = { setCurrentBusiness };
