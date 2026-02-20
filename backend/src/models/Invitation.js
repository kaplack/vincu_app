const { DataTypes } = require("sequelize");
const { BUSINESS_ROLES } = require("../constants/businessRoles");
const { INVITATION_STATUS } = require("../constants/invitationStatus");

function initInvitationModel(sequelize) {
  const Invitation = sequelize.define(
    "Invitation",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      businessId: { type: DataTypes.UUID, allowNull: false },

      email: { type: DataTypes.STRING(180), allowNull: false },
      role: {
        type: DataTypes.ENUM(...Object.values(BUSINESS_ROLES)),
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM(...Object.values(INVITATION_STATUS)),
        allowNull: false,
        defaultValue: INVITATION_STATUS.PENDING,
      },

      token: { type: DataTypes.STRING(120), allowNull: false, unique: true },

      invitedByUserId: { type: DataTypes.UUID, allowNull: false },
      invitedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },

      expiresAt: { type: DataTypes.DATE, allowNull: false },

      acceptedByUserId: { type: DataTypes.UUID, allowNull: true },
      acceptedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "invitations",
      timestamps: true,
      indexes: [
        { fields: ["businessId"] },
        { fields: ["email"] },
        { unique: true, fields: ["token"] },
      ],
    }
  );

  return Invitation;
}

module.exports = { initInvitationModel };
