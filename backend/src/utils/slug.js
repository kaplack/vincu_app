// backend/src/utils/slug.js
const { Op } = require("sequelize");

/**
 * Normalize string to URL-safe slug
 */
function slugify(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Generate unique slug for principal business
 */
async function generateUniqueBusinessSlug({
  commercialName,
  BusinessModel,
  transaction,
}) {
  const base = slugify(commercialName);

  if (!base) {
    const rand = Math.random().toString(36).slice(2, 8);
    return `business-${rand}`;
  }

  // Try base
  const exists = await BusinessModel.findOne({
    where: { slug: base },
    transaction,
  });
  if (!exists) return base;

  // Try incremental
  const rows = await BusinessModel.findAll({
    where: { slug: { [Op.like]: `${base}-%` } },
    attributes: ["slug"],
    transaction,
  });

  let max = 1;
  for (const r of rows) {
    const m = r.slug.match(new RegExp(`^${base}-(\\d+)$`));
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }

  return `${base}-${max + 1}`;
}

module.exports = { slugify, generateUniqueBusinessSlug };
