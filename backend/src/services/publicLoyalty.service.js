// backend/src/services/publicLoyalty.service.js
const crypto = require("crypto");
const { Op } = require("sequelize");
const { sequelize } = require("../config/db");
const { HttpError } = require("../utils/httpError");
const { signAccessToken } = require("../utils/jwt");

function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}

function safeTrim(v) {
  return typeof v === "string" ? v.trim() : "";
}

function normalizePhone(phone) {
  return safeTrim(phone);
}

async function joinBySlug(slug, payload) {
  const Business = sequelize.models.Business;
  const Customer = sequelize.models.Customer;
  const CustomerMembership = sequelize.models.CustomerMembership;
  const PointsTransaction = sequelize.models.PointsTransaction;

  const slugTrim = safeTrim(slug);
  const firstName = safeTrim(payload?.firstName);
  const lastName = safeTrim(payload?.lastName);
  const documentNumber = safeTrim(payload?.documentNumber);
  const phone = normalizePhone(payload?.phone);

  if (!slugTrim) throw new HttpError(400, "Invalid data.", "INVALID_INPUT");
  if (!firstName || !lastName || !documentNumber || !phone) {
    throw new HttpError(400, "Invalid data.", "INVALID_INPUT");
  }

  // Find principal business by slug
  const business = await Business.findOne({ where: { slug: slugTrim } });
  if (!business) throw new HttpError(404, "Not found.", "BUSINESS_NOT_FOUND");
  if (business.parentId) {
    // Just in case: slug should belong to principal only
    throw new HttpError(400, "Invalid business.", "BIZ_NOT_PRINCIPAL");
  }

  const result = await sequelize.transaction(async (t) => {
    // Upsert-ish Customer by phone
    let customer = await Customer.findOne({ where: { phone }, transaction: t });

    if (!customer) {
      customer = await Customer.create(
        {
          firstName,
          lastName,
          documentType: "DNI",
          documentNumber,
          phone,
          isActive: true,
        },
        { transaction: t },
      );
    } else {
      // MVP choice: keep DNI in sync silently (no leaking)
      customer.firstName = customer.firstName?.trim() || firstName;
      customer.lastName = customer.lastName?.trim() || lastName;
      customer.documentType = "DNI";
      customer.documentNumber = documentNumber;
      await customer.save({ transaction: t });
    }

    // Ensure 1 membership per business
    let membership = await CustomerMembership.findOne({
      where: { customerId: customer.id, businessId: business.id },
      transaction: t,
    });

    if (!membership) {
      const publicToken = randomToken(32);
      const qrToken = randomToken(32);
      const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days default

      membership = await CustomerMembership.create(
        {
          customerId: customer.id,
          businessId: business.id,
          pointsBalance: 0,
          publicToken,
          publicTokenExpiresAt: expiresAt,
          qrToken,
          status: "active",
          walletStatus: "none",
        },
        { transaction: t },
      );
    }

    const transactions = await PointsTransaction.findAll({
      where: { customerMembershipId: membership.id },
      order: [["createdAt", "DESC"]],
      limit: 10,
      transaction: t,
    });

    return { customer, membership, transactions };
  });

  return {
    business: {
      id: business.id,
      commercialName: business.commercialName,
      slug: business.slug,
    },
    customer: {
      id: result.customer.id,
      firstName: result.customer.firstName,
      lastName: result.customer.lastName,
      phone: result.customer.phone,
    },
    membership: {
      id: result.membership.id,
      businessId: result.membership.businessId,
      pointsBalance: result.membership.pointsBalance,
      walletStatus: result.membership.walletStatus,
      publicToken: result.membership.publicToken,
      publicTokenExpiresAt: result.membership.publicTokenExpiresAt,
    },
    transactions: result.transactions,
    directLink: `/c/${result.membership.publicToken}`,
  };
}

async function consultaLogin(payload) {
  const Customer = sequelize.models.Customer;

  const phone = normalizePhone(payload?.phone);
  const documentNumber = safeTrim(payload?.documentNumber);

  // Generic message always
  if (!phone || !documentNumber) {
    throw new HttpError(401, "Invalid credentials.", "INVALID_CREDENTIALS");
  }

  const customer = await Customer.findOne({
    where: { phone, documentType: "DNI", documentNumber },
  });

  if (!customer) {
    throw new HttpError(401, "Invalid credentials.", "INVALID_CREDENTIALS");
  }

  // Use your JWT util; role=customer
  const token = signAccessToken({ sub: customer.id, role: "customer" });
  return { token };
}

async function consultaCards(customerId) {
  const CustomerMembership = sequelize.models.CustomerMembership;
  const Business = sequelize.models.Business;

  if (!customerId) throw new HttpError(401, "Unauthorized.", "AUTH_REQUIRED");

  const memberships = await CustomerMembership.findAll({
    where: { customerId, status: "active" },
    include: [
      {
        model: Business,
        as: "business",
        attributes: ["id", "commercialName", "slug"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return {
    memberships: memberships.map((m) => ({
      id: m.id,
      pointsBalance: m.pointsBalance,
      walletStatus: m.walletStatus,
      business: m.business
        ? {
            id: m.business.id,
            commercialName: m.business.commercialName,
            slug: m.business.slug,
          }
        : { id: m.businessId, commercialName: null, slug: null },
      directLink: m.publicToken ? `/c/${m.publicToken}` : null,
    })),
  };
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
  joinBySlug,
  consultaLogin,
  consultaCards,
  getByPublicToken,
};
