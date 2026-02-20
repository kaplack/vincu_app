// src/validators/reward.validator.js
const { z } = require("zod");

// Helpers
const uuidParam = z.object({
  rewardId: z.string().uuid("rewardId must be a valid UUID"),
});

const baseRewardBody = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(300).optional().nullable(),
  pointsRequired: z.number().int().min(1).max(1_000_000),
  isActive: z.boolean().optional(),
  // For soft delete approach (archive)
  isArchived: z.boolean().optional(),
});

const createRewardSchema = z.object({
  body: baseRewardBody.extend({
    // defaults handled in service/model
    isActive: z.boolean().optional(),
    isArchived: z.boolean().optional(),
  }),
});

const updateRewardSchema = z.object({
  params: uuidParam,
  body: baseRewardBody
    .partial()
    .refine(
      (val) => Object.keys(val).length > 0,
      "At least one field must be provided",
    ),
});

/**
 * Optional: list query params
 * - includeInactive: include isActive=false
 * - includeArchived: include archived
 * - q: search by name/description
 */
const listRewardsSchema = z.object({
  query: z
    .object({
      includeInactive: z
        .enum(["true", "false"])
        .optional()
        .transform((v) => v === "true"),
      includeArchived: z
        .enum(["true", "false"])
        .optional()
        .transform((v) => v === "true"),
      q: z.string().trim().max(100).optional(),
    })
    .partial(),
});

module.exports = {
  createRewardSchema,
  updateRewardSchema,
  listRewardsSchema,
};
