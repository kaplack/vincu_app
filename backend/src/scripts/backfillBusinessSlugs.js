// backend/src/scripts/backfillBusinessSlugs.js
require("dotenv").config();

const { sequelize } = require("../config/db");
const { registerModels } = require("../models");
const { generateUniqueBusinessSlug } = require("../utils/slug");

async function main() {
  // 1) Ensure models are registered (this is what your server bootstrap does)
  registerModels(sequelize);

  // 2) Optional: verify DB connection
  await sequelize.authenticate();

  const Business = sequelize.models.Business;
  if (!Business) {
    throw new Error(
      "Business model not registered. Check registerModels(sequelize).",
    );
  }

  // 3) Find principal businesses without slug
  const businesses = await Business.findAll({
    where: {
      parentId: null,
      slug: null,
    },
  });

  console.log(
    `Found ${businesses.length} principal businesses without slug...`,
  );

  for (const b of businesses) {
    const slug = await generateUniqueBusinessSlug({
      commercialName: b.commercialName,
      BusinessModel: Business,
    });

    b.slug = slug;
    await b.save();

    console.log(`✔ ${b.commercialName} -> ${slug}`);
  }

  console.log("Done.");
  await sequelize.close();
  process.exit(0);
}

main().catch(async (err) => {
  console.error(err);
  try {
    await sequelize.close();
  } catch (_) {}
  process.exit(1);
});
