// backend/src/services/customer.service.js
const crypto = require("crypto");
const { sequelize } = require("../config/db");
const { normalizePhonePE } = require("../utils/phonePE");
const { HttpError } = require("../utils/httpError");

/**
 * Generate an opaque random token.
 * @param {number} bytes
 */
function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex"); // 64 chars if bytes=32
}

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

/**
 * Create (or reuse) a Customer by phone and ensure a Membership for the given business.
 * Returns directLink based on publicToken for public card view.
 *
 * @param {string} businessId
 * @param {string|null} firstName
 * @param {string} phone
 */
async function createCustomer({ businessId, firstName, phone }) {
  const { Customer, CustomerMembership } = sequelize.models;

  if (!businessId)
    throw new HttpError(400, "businessId is required", "BUSINESS_REQUIRED");

  // 1) Normalize phone (Peru MVP) -> store as +51...
  const normalizedPhone = normalizePhonePE(phone);

  return await sequelize.transaction(async (t) => {
    // 2) Find or create Customer globally by phone
    const [customer] = await Customer.findOrCreate({
      where: { phone: normalizedPhone },
      defaults: {
        phone: normalizedPhone,
        firstName: firstName?.trim() || null,
        isActive: true,
      },
      transaction: t,
    });

    if (firstName?.trim() && !customer.firstName) {
      await customer.update(
        { firstName: firstName.trim() },
        { transaction: t },
      );
    }

    const publicToken = randomToken(32);
    const qrToken = randomToken(32);
    const expiresAt = new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000);

    const [membership, created] = await CustomerMembership.findOrCreate({
      where: { businessId, customerId: customer.id },
      defaults: {
        status: "active",
        pointsBalance: 0,
        walletStatus: "none",
        publicToken,
        publicTokenExpiresAt: expiresAt,
        qrToken,
      },
      transaction: t,
    });

    if (!created) {
      const now = new Date();
      const expired =
        membership.publicTokenExpiresAt &&
        membership.publicTokenExpiresAt <= now;

      if (!membership.publicToken || expired) {
        membership.publicToken = randomToken(32);
        membership.publicTokenExpiresAt = new Date(
          Date.now() + 5 * 365 * 24 * 60 * 60 * 1000,
        );
        await membership.save({ transaction: t });
      }
    }

    // 5) Public link for low-tech customers
    const directLink = `/c/${membership.publicToken}`;

    return {
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        documentType: customer.documentType,
        documentNumber: customer.documentNumber,
        phone: customer.phone,
      },
      membership: {
        id: membership.id,
        businessId: membership.businessId,
        customerId: membership.customerId,
        qrToken: membership.qrToken,
        publicToken: membership.publicToken,
        publicTokenExpiresAt: membership.publicTokenExpiresAt,
        pointsBalance: membership.pointsBalance,
        walletStatus: membership.walletStatus,
        status: membership.status,
      },
      directLink,
      meta: { membershipCreated: created },
    };
  });
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
  createCustomer,
  listForBusiness,
  getMembershipDetail,
  getMembershipByQrToken,
  listTransactions,
};
