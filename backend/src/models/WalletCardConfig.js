// backend/src/models/WalletCardConfig.js
const { DataTypes } = require("sequelize");

function initWalletCardConfigModel(sequelize) {
  const WalletCardConfig = sequelize.define(
    "WalletCardConfig",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      businessId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true, // 1 config por negocio
      },

      primaryColor: { type: DataTypes.STRING(7), allowNull: true },
      secondaryColor: { type: DataTypes.STRING(7), allowNull: true },
      description: { type: DataTypes.STRING(255), allowNull: true },

      syncStatus: {
        type: DataTypes.ENUM("active", "inactive", "pending", "error"),
        allowNull: false,
        defaultValue: "inactive",
      },
      syncedAt: { type: DataTypes.DATE, allowNull: true },

      walletClassId: { type: DataTypes.STRING, allowNull: true },
      walletIssuerId: { type: DataTypes.STRING, allowNull: true },
    },
    {
      tableName: "wallet_card_configs",
      timestamps: true,
      indexes: [{ fields: ["businessId"] }],
    },
  );

  return WalletCardConfig;
}

module.exports = { initWalletCardConfigModel };
