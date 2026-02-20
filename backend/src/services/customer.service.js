// backend/src/services/customer.service.js
const { sequelize } = require("../config/db");
const { HttpError } = require("../utils/httpError");

function mapMembershipRow(m) {
  const firstName = m.customer?.firstName || "";
  const lastName = m.customer?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();

  return {
    membershipId: m.id,
    customerId: m.customer?.id || m.customerId,
    fullName,
    phone: m.customer?.phone || null,
    pointsBalance: m.pointsBalance,
    status: m.status,
    registeredAt: m.createdAt,
    qrToken: m.qrToken,
    walletStatus: m.walletStatus,
    publicToken: m.publicToken,
  };
}

async function listForBusiness(businessId) {
  const CustomerMembership = sequelize.models.CustomerMembership;
  const Customer = sequelize.models.Customer;

  if (!businessId) throw new HttpError(400, "Invalid business.", "NO_BUSINESS");

  const memberships = await CustomerMembership.findAll({
    where: { businessId },
    include: [
      {
        model: Customer,
        as: "customer",
        attributes: ["id", "firstName", "lastName", "phone"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return { items: memberships.map(mapMembershipRow) };
}

async function getMembershipDetail(businessId, membershipId) {
  const CustomerMembership = sequelize.models.CustomerMembership;
  const Customer = sequelize.models.Customer;

  if (!businessId) throw new HttpError(400, "Invalid business.", "NO_BUSINESS");

  const membership = await CustomerMembership.findOne({
    where: { id: membershipId, businessId },
    include: [
      {
        model: Customer,
        as: "customer",
        attributes: ["id", "firstName", "lastName", "phone"],
      },
    ],
  });

  if (!membership) throw new HttpError(404, "Not found.", "NOT_FOUND");

  return { item: mapMembershipRow(membership) };
}

async function getMembershipByQrToken(businessId, qrToken) {
  const CustomerMembership = sequelize.models.CustomerMembership;
  const Customer = sequelize.models.Customer;

  if (!businessId) throw new HttpError(400, "Invalid business.", "NO_BUSINESS");

  const membership = await CustomerMembership.findOne({
    where: { businessId, qrToken, status: "active" }, // POS/WALLET: solo active
    include: [
      {
        model: Customer,
        as: "customer",
        attributes: ["id", "firstName", "lastName", "phone"],
      },
    ],
  });

  if (!membership) throw new HttpError(404, "Not found.", "NOT_FOUND");

  return { item: mapMembershipRow(membership) };
}

async function listTransactions(businessId, membershipId) {
  const CustomerMembership = sequelize.models.CustomerMembership;
  const PointsTransaction = sequelize.models.PointsTransaction;

  if (!businessId) throw new HttpError(400, "Invalid business.", "NO_BUSINESS");

  // Confirm membership belongs to current business
  const membership = await CustomerMembership.findOne({
    where: { id: membershipId, businessId },
    attributes: ["id"],
  });

  if (!membership) throw new HttpError(404, "Not found.", "NOT_FOUND");

  const items = await PointsTransaction.findAll({
    where: { customerMembershipId: membership.id },
    order: [["createdAt", "DESC"]],
    limit: 100,
  });

  return { items };
}

module.exports = {
  listForBusiness,
  getMembershipDetail,
  getMembershipByQrToken,
  listTransactions,
};
