// backend/src/services/walletCard.service.js
const { sequelize } = require("../config/db");
const { HttpError } = require("../utils/httpError");

function buildJoinUrl(businessId) {
  return `https://vincu.app/join/${businessId}`;
}

function isHexColor(value) {
  return typeof value === "string" && /^#[0-9A-Fa-f]{6}$/.test(value);
}

function validateBrandingByPlan(planKey, payload) {
  const plan = String(planKey || "").toLowerCase();

  if (plan === "free") {
    throw new HttpError(
      403,
      "Branding not available on Free plan.",
      "PLAN_LIMIT",
    );
  }

  if (payload.primaryColor && !isHexColor(payload.primaryColor)) {
    throw new HttpError(
      400,
      "Invalid primaryColor format.",
      "VALIDATION_ERROR",
    );
  }
  if (payload.secondaryColor && !isHexColor(payload.secondaryColor)) {
    throw new HttpError(
      400,
      "Invalid secondaryColor format.",
      "VALIDATION_ERROR",
    );
  }

  if (plan === "small" && payload.secondaryColor) {
    throw new HttpError(
      403,
      "secondaryColor is only available on Pro plan.",
      "PLAN_LIMIT",
    );
  }
}

async function getBusinessOrThrow(businessId) {
  const Business = sequelize.models.Business;
  const business = await Business.findByPk(businessId);
  if (!business)
    throw new HttpError(404, "Business not found.", "BUSINESS_NOT_FOUND");
  return business;
}

module.exports = {
  buildJoinUrl,

  async getOrCreateConfig(businessId) {
    const WalletCardConfig = sequelize.models.WalletCardConfig;

    if (!businessId)
      throw new HttpError(400, "businessId required.", "VALIDATION_ERROR");

    let config = await WalletCardConfig.findOne({ where: { businessId } });
    if (!config) {
      // Defaults
      config = await WalletCardConfig.create({
        businessId,
        primaryColor: "#2563eb",
        secondaryColor: "#1e40af",
        description: null,
        syncStatus: "inactive",
        syncedAt: null,
      });
    }

    // Always enrich response with Business.commercialName and planKey
    const business = await getBusinessOrThrow(businessId);

    return {
      id: config.id,
      businessId: config.businessId,
      commercialName: business.commercialName,
      planKey: business.planKey,
      primaryColor: config.primaryColor,
      secondaryColor: config.secondaryColor,
      description: config.description,
      syncStatus: config.syncStatus,
      syncedAt: config.syncedAt,
      walletClassId: config.walletClassId,
      walletIssuerId: config.walletIssuerId,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  },

  async updateBranding({ businessId, payload }) {
    if (!businessId)
      throw new HttpError(400, "businessId required.", "VALIDATION_ERROR");

    const business = await getBusinessOrThrow(businessId);
    validateBrandingByPlan(business.planKey, payload || {});

    const WalletCardConfig = sequelize.models.WalletCardConfig;
    let config = await WalletCardConfig.findOne({ where: { businessId } });
    if (!config) config = await WalletCardConfig.create({ businessId });

    await config.update({
      primaryColor: payload.primaryColor ?? config.primaryColor,
      secondaryColor: payload.secondaryColor ?? config.secondaryColor,
      description: payload.description ?? config.description,
    });

    // Return enriched payload for frontend
    return this.getOrCreateConfig(businessId);
  },
};
