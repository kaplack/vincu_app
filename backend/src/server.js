// backend/src/server.js
require("dotenv").config();

const app = require("./app");
const { sequelize } = require("./config/db");
const { registerModels } = require("./models");

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    registerModels(sequelize);
    await sequelize.authenticate();

    // Dev-friendly. Replace with migrations later.
    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync({ alter: true });
    }

    app.listen(PORT, () => {
      console.log(`✅ Vincu backend listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

bootstrap();
