// backend/src/models/PointsTransaction.js
const { DataTypes } = require("sequelize");
const Sequelize = require("sequelize");

function initPointsTransactionModel(sequelize) {
  const PointsTransaction = sequelize.define(
    "PointsTransaction",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      customerMembershipId: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      type: {
        type: DataTypes.STRING(10),
        allowNull: false, // earn | redeem | refund | adjust
      },

      points: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // Link to redemption (optional)
      relatedRedemptionId: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      // --- Audit / context fields (MVP) ---
      operatorUserId: {
        type: DataTypes.UUID,
        allowNull: true, // null = system
      },
      branchId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      source: {
        type: DataTypes.ENUM("manual", "qr", "system"),
        allowNull: false,
        defaultValue: "manual",
      },
      idempotencyKey: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },

      note: {
        type: DataTypes.STRING(160),
        allowNull: true,
      },
    },
    {
      tableName: "points_transactions",
      timestamps: true,
      indexes: [
        { fields: ["customerMembershipId"] },
        { fields: ["type"] },

        { fields: ["operatorUserId"] },
        { fields: ["branchId"] },
        { fields: ["source"] },

        // NEW
        { fields: ["relatedRedemptionId"] },

        // Prevent duplicates on retries/double-click
        {
          unique: true,
          fields: ["customerMembershipId", "idempotencyKey"],
          where: { idempotencyKey: { [Sequelize.Op.ne]: null } },
        },
      ],
    },
  );

  return PointsTransaction;
}

module.exports = { initPointsTransactionModel };
