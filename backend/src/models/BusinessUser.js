// backend/src/models/BusinessUser.js
const { DataTypes } = require("sequelize");
const { BUSINESS_ROLES } = require("../constants/businessRoles");
const { MEMBERSHIP_STATUS } = require("../constants/membershipStatus");

function initBusinessUserModel(sequelize) {
  const BusinessUser = sequelize.define(
    "BusinessUser",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      businessId: { type: DataTypes.UUID, allowNull: false },
      userId: { type: DataTypes.UUID, allowNull: false },
      branchId: { type: DataTypes.UUID, allowNull: true },

      role: {
        type: DataTypes.ENUM(...Object.values(BUSINESS_ROLES)),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(...Object.values(MEMBERSHIP_STATUS)),
        allowNull: false,
        defaultValue: MEMBERSHIP_STATUS.ACTIVE,
      },

      invitedByUserId: { type: DataTypes.UUID, allowNull: true },
      invitedAt: { type: DataTypes.DATE, allowNull: true },
      acceptedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "business_users",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["businessId", "userId"] },
        { fields: ["businessId", "branchId"] },
        { fields: ["userId"] },
      ],
    },
  );

  return BusinessUser;
}

module.exports = { initBusinessUserModel };
