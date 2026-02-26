// backend/src/services/walletCard.service.js
const { sequelize } = require("../config/db");
const { HttpError } = require("../utils/httpError");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { GoogleAuth } = require("google-auth-library");

function buildJoinUrl(businessId) {
  return `https://vincu.app/join/${businessId}`;
}

function readGoogleWalletServiceAccount() {
  const rawJson = process.env.GOOGLE_WALLET_SA_KEY_JSON;
  const path = process.env.GOOGLE_WALLET_SA_KEY_PATH;

  if (rawJson) return JSON.parse(rawJson);
  if (path) return JSON.parse(fs.readFileSync(path, "utf8"));

  throw new HttpError(
    500,
    "Google Wallet service account key is not configured.",
    "WALLET_KEY_MISSING",
  );
}

async function getWalletAccessToken() {
  const key = readGoogleWalletServiceAccount();

  const auth = new GoogleAuth({
    credentials: {
      client_email: key.client_email,
      private_key: key.private_key,
    },
    scopes: ["https://www.googleapis.com/auth/wallet_object.issuer"],
  });

  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  const accessToken = tokenResponse?.token;

  if (!accessToken) {
    throw new HttpError(
      500,
      "Failed to get Google access token.",
      "WALLET_AUTH_FAILED",
    );
  }

  return accessToken;
}

async function patchLoyaltyObject(objectId, patchBody) {
  const accessToken = await getWalletAccessToken();

  const url = `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${encodeURIComponent(
    objectId,
  )}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patchBody),
  });

  const text = await res.text();
  if (!res.ok) {
    // Importante: devuelve el body para debug
    throw new HttpError(
      502,
      `Google Wallet PATCH failed: ${res.status} ${text}`,
      "WALLET_PATCH_FAILED",
    );
  }

  return text ? JSON.parse(text) : null;
}

function buildFallbackClassId({ issuerId, business }) {
  const raw = business.slug || business.id;
  const key = String(raw)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_") // todo lo que no sea alfanumérico → "_"
    .replace(/^_+|_+$/g, ""); // limpia "_" al inicio/fin

  return `${issuerId}.loy_${key}`;
}

function buildObjectId({ issuerId, membershipId }) {
  return `${issuerId}.m_${membershipId}`;
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
      config = await WalletCardConfig.create({
        businessId,
        primaryColor: "#2563eb",
        secondaryColor: "#1e40af",
        description: null,
        syncStatus: "inactive",
        syncedAt: null,
      });
    }

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

    return this.getOrCreateConfig(businessId);
  },

  // ✅ NUEVO: Save-to-Wallet desde /c/:token (publicToken)
  async buildSaveUrlByPublicToken(publicToken) {
    if (!publicToken) {
      throw new HttpError(400, "token is required.", "VALIDATION_ERROR");
    }

    const WalletCardConfig = sequelize.models.WalletCardConfig;
    const { CustomerMembership, Customer, Business } = sequelize.models;

    // 1) Buscar membership por publicToken (expirable)
    const membership = await CustomerMembership.findOne({
      where: { publicToken },
      include: [
        { model: Customer, as: "customer", attributes: ["id", "phone"] },
        {
          model: Business,
          as: "business",
          attributes: ["id", "slug", "commercialName", "planKey"],
        },
      ],
    });

    if (!membership) {
      throw new HttpError(404, "Membership not found.", "MEMBERSHIP_NOT_FOUND");
    }
    if (membership.status !== "active") {
      throw new HttpError(
        403,
        "Membership is not active.",
        "MEMBERSHIP_BLOCKED",
      );
    }

    // 2) Validar expiración (si existe)
    if (membership.publicTokenExpiresAt) {
      const exp = new Date(membership.publicTokenExpiresAt).getTime();
      if (Number.isFinite(exp) && Date.now() > exp) {
        throw new HttpError(
          410,
          "Public token expired.",
          "PUBLIC_TOKEN_EXPIRED",
        );
      }
    }

    // 3) Resolver config del negocio (para issuerId / classId si ya existen)
    const config = await WalletCardConfig.findOne({
      where: { businessId: membership.businessId },
    });

    const issuerId =
      config?.walletIssuerId || process.env.GOOGLE_WALLET_ISSUER_ID;

    if (!issuerId) {
      throw new HttpError(
        500,
        "GOOGLE_WALLET_ISSUER_ID missing (or walletIssuerId not set).",
        "WALLET_ENV_MISSING",
      );
    }

    const key = readGoogleWalletServiceAccount();

    const classId =
      config?.walletClassId ||
      membership.walletClassId ||
      buildFallbackClassId({ issuerId, business: membership.business });

    const objectId =
      membership.walletObjectId ||
      buildObjectId({ issuerId, membershipId: membership.id });

    // 4) Construir loyaltyObject (MVP seguro)
    // Nota: En V3 ya tienes qrToken long-lived para POS; aquí lo usamos como barcode value.
    const loyaltyObject = {
      id: objectId,
      classId,
      state: "active",
      accountId: String(membership.id),
      accountName: membership.business?.commercialName || "VINCU",
      barcode: {
        type: "qrCode",
        value: membership.qrToken,
        alternateText: "Escanea para sumar puntos",
      },
      loyaltyPoints: {
        label: "Puntos",
        balance: { int: Number(membership.pointsBalance || 0) },
      },
    };

    console.log("WALLET issuerId:", issuerId);
    console.log("WALLET classId:", classId);
    console.log("WALLET objectId:", objectId);

    // 5) Firmar JWT savetowallet
    const claims = {
      iss: key.client_email,
      aud: "google",
      typ: "savetowallet",
      payload: {
        loyaltyObjects: [loyaltyObject],
      },
    };

    const tokenJwt = jwt.sign(claims, key.private_key, { algorithm: "RS256" });
    const saveUrl = `https://pay.google.com/gp/v/save/${tokenJwt}`;

    // 6) Persistir IDs (opcional pero recomendado)
    // Esto te ayuda luego para “sync/update”
    await membership.update({
      walletStatus:
        membership.walletStatus === "none"
          ? "pending"
          : membership.walletStatus,
      walletObjectId: objectId,
      walletClassId: classId,
    });

    return { saveUrl };
  },

  /**
   * Sync pointsBalance to Google Wallet (REST PATCH).
   * - No crea pases.
   * - Solo actualiza si existe walletObjectId.
   */
  async syncWalletPoints({ membershipId, businessId, pointsBalance }) {
    const CustomerMembership = sequelize.models.CustomerMembership;

    const membership = await CustomerMembership.findOne({
      where: { id: membershipId, businessId },
      attributes: ["id", "walletStatus", "walletObjectId", "walletClassId"],
    });

    if (!membership) return { synced: false, reason: "membership_not_found" };

    // Solo si ya existe pase creado
    if (!membership.walletObjectId) {
      return { synced: false, reason: "no_wallet_object" };
    }

    if (membership.walletStatus === "none") {
      return { synced: false, reason: "wallet_status_none" };
    }

    await patchLoyaltyObject(membership.walletObjectId, {
      loyaltyPoints: {
        label: "Puntos",
        balance: { int: Number(pointsBalance || 0) },
      },
    });

    return { synced: true };
  },
};
