// backend/src/models/Customer.js
const { DataTypes } = require("sequelize");

function initCustomerModel(sequelize) {
  const Customer = sequelize.define(
    "Customer",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      firstName: {
        type: DataTypes.STRING(80),
        allowNull: true,
      },
      lastName: {
        type: DataTypes.STRING(80),
        allowNull: true,
      },

      documentType: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "DNI",
      },
      documentNumber: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },

      // Global unique identifier for customer (MVP)
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "customers",
      timestamps: true,
      indexes: [
        { fields: ["phone"], unique: true },
        { fields: ["documentType", "documentNumber"] },
      ],
    },
  );

  return Customer;
}

module.exports = { initCustomerModel };
