// backend/src/models/Reward.js
const { DataTypes } = require("sequelize");

function initRewardModel(sequelize) {
  const Reward = sequelize.define(
    "Reward",
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

      name: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },

      description: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },

      pointsRequired: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      // Soft delete / archive
      isArchived: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      // Optional audit fields (not required)
      createdByUserId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      updatedByUserId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      tableName: "rewards",
      timestamps: true,
      indexes: [
        { fields: ["businessId"] },
        { fields: ["isActive"] },
        { fields: ["isArchived"] },
        { fields: ["businessId", "isActive"] },
      ],
    },
  );

  return Reward;
}

module.exports = { initRewardModel };
