// src/validators/redemption.validator.js
const { z } = require("zod");

/**
 * GET /api/redemptions
 * Query:
 * - status: issued|redeemed|cancelled (optional)
 * - q: search by redeemCode or customer name/phone (optional)
 * - includeCancelled: true/false (optional)
 */
const listRedemptionsSchema = z.object({
  query: z
    .object({
      status: z.enum(["issued", "redeemed", "cancelled"]).optional(),
      q: z.string().trim().max(120).optional(),
      includeCancelled: z
        .enum(["true", "false"])
        .optional()
        .transform((v) => v === "true"),
    })
    .partial(),
});

/**
 * POST /api/redemptions/consume
 * Body:
 * - redeemCode: string
 */
const consumeRedemptionSchema = z.object({
  body: z.object({
    redeemCode: z.string().trim().min(8).max(64),
    branchId: z.string().uuid(),
  }),
});

/**
 * POST /api/redemptions/cancel
 * Body:
 * - redeemCode: string
 * - reasonCode: enum
 * - reasonText: required if reasonCode=other
 */
const cancelRedemptionSchema = z
  .object({
    body: z.object({
      redeemCode: z.string().trim().min(8).max(64),
      reasonCode: z.enum([
        "customer_changed_mind",
        "operator_error",
        "reward_unavailable",
        "system_issue",
        "wrong_code",
        "other",
      ]),
      reasonText: z.string().trim().min(5).max(200).optional(),
    }),
  })
  .superRefine((data, ctx) => {
    const { reasonCode, reasonText } = data.body;
    if (
      reasonCode === "other" &&
      (!reasonText || reasonText.trim().length < 5)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "reasonText is required when reasonCode is 'other'",
        path: ["body", "reasonText"],
      });
    }
  });

module.exports = {
  listRedemptionsSchema,
  consumeRedemptionSchema,
  cancelRedemptionSchema,
};
