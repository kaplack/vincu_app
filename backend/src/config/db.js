// backend/src/config/db.js
const { Sequelize } = require("sequelize");

const isProd = process.env.NODE_ENV === "production";
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

// Prefer DATABASE_URL (Neon/Render). Fallback to discrete env vars (local).
const sequelize = hasDatabaseUrl
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      logging: isProd ? false : console.log,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 5432),
        dialect: "postgres",
        logging: isProd ? false : console.log,
      },
    );

module.exports = { sequelize };
