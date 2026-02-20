// src/services/catalog.service.js
const { Op } = require("sequelize");
const crypto = require("crypto");

const { HttpError } = require("../utils/httpError");
const models = require("../models");

const pointsService = require("./points.service");

/**
 * Generate a human-friendly redeem code (base32-ish uppercase)
 * Example: 4FJ9K2Q8M7L3A9D2 (16 chars)
 */
function generateRedeemCode(length = 16) {
  // 0/1/I/O avoided for readability
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

async function listActiveRewards({ businessSlug, q }) {
  const business = await models.Business.findOne({
    where: { slug: businessSlug },
    attributes: ["id", "slug", "name"],
  });

  if (!business) {
    throw new HttpError(404, "Business not found.", "BUSINESS_NOT_FOUND");
  }

  const where = {
    businessId: business.id, // principal business
    isActive: true,
    isArchived: false,
  };

  if (q && q.trim()) {
    where.name = { [Op.iLike]: `%${q.trim()}%` };
  }

  const items = await models.Reward.findAll({
    where,
    order: [["createdAt", "DESC"]],
  });

  return items;
}

/**
 * Create redemption (Option A):
 * - Validate reward active
 * - Validate membership belongs to business + has enough points
 * - Create RewardRedemption (issued, expiresAt +7d, redeemCode)
 * - Create PointsTransaction: redeem (negative)
 * - Store relatedRedemptionId in PointsTransaction
 */
async function createRedemption({
  customerId,
  businessSlug,
  rewardId,
  idempotencyKey,
}) {
  if (!customerId) {
    throw new HttpError(
      401,
      "Customer context missing.",
      "CUSTOMER_CONTEXT_MISSING",
    );
  }

  const business = await models.Business.findOne({
    where: { slug: businessSlug },
    attributes: ["id", "slug", "name"],
  });

  if (!business) {
    throw new HttpError(404, "Business not found.", "BUSINESS_NOT_FOUND");
  }

  const businessId = business.id;

  const membership = await models.CustomerMembership.findOne({
    where: { customerId, businessId },
  });

  if (!membership) {
    throw new HttpError(
      403,
      "Customer is not a member of this business.",
      "NOT_A_MEMBER",
    );
  }

  // reward must belong to this business and be active
  const reward = await models.Reward.findOne({
    where: {
      id: rewardId,
      businessId,
      isActive: true,
      isArchived: false,
    },
  });

  if (!reward) {
    throw new HttpError(404, "Reward not found.", "REWARD_NOT_FOUND");
  }

  if ((membership.pointsBalance ?? 0) < reward.pointsRequired) {
    throw new HttpError(409, "Insufficient points.", "INSUFFICIENT_POINTS");
  }

  const membershipId = membership.id;

  const finalIdempotencyKey =
    idempotencyKey || `redeem-${membershipId}-${rewardId}-${Date.now()}`;

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const result = await models.sequelize.transaction(async (t) => {
    let redeemCode = generateRedeemCode(16);

    for (let i = 0; i < 5; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const exists = await models.RewardRedemption.findOne({
        where: { redeemCode },
        transaction: t,
      });
      if (!exists) break;
      redeemCode = generateRedeemCode(16);
    }

    const redemption = await models.RewardRedemption.create(
      {
        businessId,
        rewardId,
        customerMembershipId: membershipId,
        redeemCode,
        status: "issued",
        issuedAt: new Date(),
        expiresAt,
        pointsCostSnapshot: reward.pointsRequired,
        rewardNameSnapshot: reward.name,
      },
      { transaction: t },
    );

    await pointsService.createTransaction(
      businessId,
      null,
      {
        membershipId,
        type: "redeem",
        points: -Math.abs(reward.pointsRequired),
        note: `Canje de recompensa: ${reward.name}`,
        source: "system",
        branchId: null,
        idempotencyKey: finalIdempotencyKey,
        relatedRedemptionId: redemption.id,
      },
      { transaction: t },
    );

    return redemption;
  });

  const redemption = result;

  return {
    redemptionId: redemption.id,
    redeemCode: redemption.redeemCode,
    status: redemption.status,
    issuedAt: redemption.issuedAt,
    expiresAt: redemption.expiresAt,
    pointsCost: redemption.pointsCostSnapshot,
    rewardName: redemption.rewardNameSnapshot,
  };
}

module.exports = {
  listActiveRewards,
  createRedemption,
};
