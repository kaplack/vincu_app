// backend/src/services/me.service.js
const crypto = require("crypto");
const { sequelize } = require("../config/db");
const { HttpError } = require("../utils/httpError");

function randomCode(len = 8) {
  return crypto.randomBytes(len).toString("hex").toUpperCase();
}

async function listMemberships(customerId) {
  const { CustomerMembership, Business } = sequelize.models;

  const memberships = await CustomerMembership.findAll({
    where: { customerId, status: "active" },
    include: [
      {
        model: Business,
        as: "business",
        attributes: ["id", "commercialName"], // agrega primaryColor si lo tienes
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return {
    memberships: memberships.map((m) => ({
      id: m.id,
      businessId: m.businessId,
      pointsBalance: m.pointsBalance,
      qrToken: m.qrToken,
      walletStatus: m.walletStatus,
      business: m.business
        ? {
            id: m.business.id,
            commercialName: m.business.commercialName,
          }
        : null,
    })),
  };
}

async function listMembershipTransactions(customerId, membershipId) {
  const { CustomerMembership, PointsTransaction } = sequelize.models;

  const membership = await CustomerMembership.findOne({
    where: { id: membershipId, customerId, status: "active" },
  });

  if (!membership) {
    throw new HttpError(404, "Membership not found.", "MEMBERSHIP_NOT_FOUND");
  }

  const tx = await PointsTransaction.findAll({
    where: { customerMembershipId: membership.id },
    order: [["createdAt", "DESC"]],
    limit: 50,
  });

  return { membershipId, transactions: tx };
}

async function listBusinessRewards(customerId, businessId) {
  const { CustomerMembership, Reward } = sequelize.models;

  const membership = await CustomerMembership.findOne({
    where: { customerId, businessId, status: "active" },
  });

  if (!membership) {
    throw new HttpError(403, "Access denied.", "BIZ_ACCESS_DENIED");
  }

  const rewards = await Reward.findAll({
    where: {
      businessId,
      isActive: true,
      isArchived: false,
    },
    order: [["pointsRequired", "ASC"]],
  });

  const points = membership.pointsBalance;

  const items = rewards.map((r) => {
    const canRedeem = points >= r.pointsRequired;
    return {
      id: r.id,
      name: r.name,
      description: r.description,
      pointsRequired: r.pointsRequired,
      canRedeem,
      missingPoints: canRedeem ? 0 : r.pointsRequired - points,
    };
  });

  items.sort((a, b) => Number(b.canRedeem) - Number(a.canRedeem));

  return {
    businessId,
    pointsBalance: points,
    rewards: items,
  };
}

async function createRedemption(customerId, payload) {
  const { CustomerMembership, Reward, RewardRedemption, PointsTransaction } =
    sequelize.models;

  const { membershipId, rewardId } = payload;

  return sequelize.transaction(async (t) => {
    const membership = await CustomerMembership.findOne({
      where: { id: membershipId, customerId, status: "active" },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!membership) {
      throw new HttpError(404, "Membership not found.", "MEMBERSHIP_NOT_FOUND");
    }

    const reward = await Reward.findOne({
      where: {
        id: rewardId,
        businessId: membership.businessId,
        isActive: true,
        isArchived: false,
      },
      transaction: t,
    });

    if (!reward) {
      throw new HttpError(404, "Reward not found.", "REWARD_NOT_FOUND");
    }

    if (membership.pointsBalance < reward.pointsRequired) {
      throw new HttpError(400, "Insufficient points.", "INSUFFICIENT_POINTS");
    }

    const redeemCode = randomCode(6);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const redemption = await RewardRedemption.create(
      {
        businessId: membership.businessId,
        rewardId: reward.id,
        customerMembershipId: membership.id,
        redeemCode,
        status: "issued",
        expiresAt,
        pointsCostSnapshot: reward.pointsRequired,
        rewardNameSnapshot: reward.name,
      },
      { transaction: t },
    );

    await PointsTransaction.create(
      {
        customerMembershipId: membership.id,
        type: "redeem",
        points: -Math.abs(reward.pointsRequired),
        relatedRedemptionId: redemption.id,
        source: "system",
        note: `Redeem: ${reward.name}`,
      },
      { transaction: t },
    );

    membership.pointsBalance -= reward.pointsRequired;
    await membership.save({ transaction: t });

    return {
      redemption: {
        id: redemption.id,
        redeemCode: redemption.redeemCode,
        expiresAt: redemption.expiresAt,
        status: redemption.status,
      },
      newBalance: membership.pointsBalance,
    };
  });
}

async function getRedemptionById(customerId, redemptionId) {
  const { RewardRedemption, CustomerMembership } = sequelize.models;

  const redemption = await RewardRedemption.findOne({
    where: { id: redemptionId },
    include: [
      {
        model: CustomerMembership,
        as: "membership",
        attributes: ["id", "customerId", "businessId"],
      },
    ],
  });

  if (!redemption) {
    throw new HttpError(404, "Redemption not found.", "REDEMPTION_NOT_FOUND");
  }

  if (
    !redemption.membership ||
    redemption.membership.customerId !== customerId
  ) {
    throw new HttpError(403, "Forbidden.", "REDEMPTION_FORBIDDEN");
  }

  return {
    redemption: {
      id: redemption.id,
      status: redemption.status,
      redeemCode: redemption.redeemCode,
      expiresAt: redemption.expiresAt,
      pointsCostSnapshot: redemption.pointsCostSnapshot,
      rewardNameSnapshot: redemption.rewardNameSnapshot,
      businessId: redemption.businessId,
      customerMembershipId: redemption.customerMembershipId,
    },
  };
}

module.exports = {
  listMemberships,
  listMembershipTransactions,
  listBusinessRewards,
  createRedemption,
  getRedemptionById,
};
