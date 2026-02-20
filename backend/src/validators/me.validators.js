const { z } = require("zod");

const membershipIdParamsSchema = z.object({
  membershipId: z.string().uuid(),
});

const businessIdParamsSchema = z.object({
  businessId: z.string().uuid(),
});

const createRedemptionBodySchema = z.object({
  membershipId: z.string().uuid(),
  rewardId: z.string().uuid(),
});

const redemptionIdParamsSchema = z.object({
  redemptionId: z.string().uuid(),
});

module.exports = {
  membershipIdParamsSchema,
  businessIdParamsSchema,
  createRedemptionBodySchema,
  redemptionIdParamsSchema,
};
