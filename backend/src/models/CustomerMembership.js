// backend/src/models/CustomerMembership.js
const { DataTypes } = require("sequelize");

function initCustomerMembershipModel(sequelize) {
  const CustomerMembership = sequelize.define(
    "CustomerMembership",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      customerId: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      // IMPORTANT: this must reference the PRINCIPAL business (parentId = null)
      businessId: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      pointsBalance: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      // /c/:token (expirable)
      publicToken: {
        type: DataTypes.STRING(120),
        allowNull: true,
        unique: true,
      },
      publicTokenExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      // QR token for POS operations (long-lived)
      qrToken: {
        type: DataTypes.STRING(120),
        allowNull: true,
        unique: true,
      },

      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "active", // active | blocked
      },

      // Wallet readiness (future)
      walletStatus: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "none", // none | pending | issued | revoked
      },
      walletObjectId: {
        type: DataTypes.STRING(160),
        allowNull: true,
      },
      walletClassId: {
        type: DataTypes.STRING(160),
        allowNull: true,
      },
      walletIssuedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "customer_memberships",
      timestamps: true,
      indexes: [
        { fields: ["customerId", "businessId"], unique: true }, // 1 tarjeta por negocio
        { fields: ["publicToken"], unique: true },
        { fields: ["qrToken"], unique: true },
        { fields: ["businessId"] },
      ],
    },
  );

  return CustomerMembership;
}

module.exports = { initCustomerMembershipModel };
