// backend/src/services/publicLoyalty.service.js
const crypto = require("crypto");
const { Op } = require("sequelize");
const { sequelize } = require("../config/db");
const { HttpError } = require("../utils/httpError");

function safeTrim(v) {
  return typeof v === "string" ? v.trim() : "";
}

async function getByPublicToken(token) {
  const CustomerMembership = sequelize.models.CustomerMembership;
  const Business = sequelize.models.Business;
  const Customer = sequelize.models.Customer;
  const PointsTransaction = sequelize.models.PointsTransaction;

  const tokenTrim = safeTrim(token);
  if (!tokenTrim) throw new HttpError(404, "Not found.", "NOT_FOUND");

  const membership = await CustomerMembership.findOne({
    where: {
      publicToken: tokenTrim,
      publicTokenExpiresAt: { [Op.gt]: new Date() },
      status: "active",
    },
    include: [
      {
        model: Business,
        as: "business",
        attributes: ["id", "commercialName", "slug"],
      },
      {
        model: Customer,
        as: "customer",
        attributes: ["id", "firstName", "lastName", "phone"],
      },
    ],
  });

  if (!membership) throw new HttpError(404, "Not found.", "NOT_FOUND");

  const transactions = await PointsTransaction.findAll({
    where: { customerMembershipId: membership.id },
    order: [["createdAt", "DESC"]],
    limit: 10,
  });

  return {
    membership: {
      id: membership.id,
      pointsBalance: membership.pointsBalance,
      walletStatus: membership.walletStatus,
    },
    business: membership.business,
    customer: membership.customer,
    transactions,
  };
}

module.exports = {
  getByPublicToken,
};
