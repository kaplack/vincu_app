// backend/src/models/RewardRedemption.js
const { DataTypes } = require("sequelize");

function initRewardRedemptionModel(sequelize) {
  const RewardRedemption = sequelize.define(
    "RewardRedemption",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      // IMPORTANT: businessId points to PRINCIPAL business
      businessId: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      rewardId: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      customerMembershipId: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      // Human-friendly code for QR + manual input
      redeemCode: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
      },

      // issued -> redeemed OR cancelled (manual/auto)
      status: {
        type: DataTypes.ENUM("issued", "redeemed", "cancelled"),
        allowNull: false,
        defaultValue: "issued",
      },

      issuedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },

      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      redeemedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      redeemedByUserId: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      // Context branch where it was consumed/cancelled (optional)
      branchId: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      // Cancellation fields
      cancelledAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      cancelledByUserId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      cancelledSource: {
        type: DataTypes.ENUM("manual", "auto"),
        allowNull: true,
      },
      cancelReasonCode: {
        type: DataTypes.STRING(40),
        allowNull: true,
      },
      cancelReasonText: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },

      // Snapshots (for coupon consistency)
      pointsCostSnapshot: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      rewardNameSnapshot: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
    },
    {
      tableName: "reward_redemptions",
      timestamps: true,
      indexes: [
        { fields: ["businessId"] },
        { fields: ["rewardId"] },
        { fields: ["customerMembershipId"] },
        { fields: ["status"] },
        { fields: ["expiresAt"] },
        { fields: ["businessId", "status"] },
        { fields: ["businessId", "customerMembershipId"] },
      ],
    },
  );

  return RewardRedemption;
}

module.exports = { initRewardRedemptionModel };
