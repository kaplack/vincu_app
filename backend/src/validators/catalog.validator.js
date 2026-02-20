// src/validators/catalog.validator.js
const { z } = require("zod");

// Slug: ajusta regex si tu sistema permite otros caracteres
const slugParam = z.object({
  businessSlug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, "Invalid businessSlug"),
});

/**
 * GET /api/catalog/:businessSlug/rewards
 * Optional query:
 * - q: search by reward name
 */
const listCatalogRewardsSchema = z.object({
  params: slugParam,
  query: z
    .object({
      q: z.string().trim().max(100).optional(),
    })
    .partial(),
});

/**
 * POST /api/catalog/redemptions
 * Customer JWT required (requireCustomer)
 * Body:
 * - rewardId: UUID
 * - idempotencyKey: string (recommended to avoid double click)
 */
const createCatalogRedemptionSchema = z.object({
  params: slugParam,
  body: z.object({
    rewardId: z.string().uuid("rewardId must be a valid UUID"),
    idempotencyKey: z.string().trim().min(10).max(120).optional(),
  }),
});

module.exports = {
  listCatalogRewardsSchema,
  createCatalogRedemptionSchema,
};
