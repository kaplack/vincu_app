const { DataTypes } = require("sequelize");
const { ROLES } = require("../constants/roles");

function initUserModel(sequelize) {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING(80), allowNull: false },
      lastName: { type: DataTypes.STRING(80), allowNull: false },
      email: {
        type: DataTypes.STRING(180),
        allowNull: true,
        unique: true,
        validate: { isEmail: true },
      },
      phone: { type: DataTypes.STRING(32), allowNull: true, unique: true },
      passwordHash: { type: DataTypes.STRING(255), allowNull: false },

      /**
       * Global role.
       * - USER: default for anyone
       * - SUPERADMIN: platform-wide access (not tied to a business)
       *
       * Business permissions are derived from BusinessUser (membership) records.
       */
      role: {
        type: DataTypes.ENUM(...Object.values(ROLES)),
        allowNull: false,
        defaultValue: ROLES.USER,
      },

      // Used by the frontend to remember which business the user is currently working on.
      currentBusinessId: { type: DataTypes.UUID, allowNull: true },
    },
    {
      tableName: "users",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["email"] },
        { unique: true, fields: ["phone"] },
      ],
    }
  );

  return User;
}

module.exports = { initUserModel };
