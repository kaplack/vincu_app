// backend/src/validators/points.validators.js
const { z } = require("zod");

const createPointsTxSchema = z
  .object({
    membershipId: z.string().uuid(),
    type: z.enum(["earn", "adjust", "redeem"]).default("earn"),
    points: z.number().int(),
    note: z.string().trim().max(160).optional(),

    branchId: z.string().uuid().optional().nullable(),
    source: z.enum(["manual", "qr", "system"]).optional().default("manual"),
    idempotencyKey: z.string().trim().min(6).max(64).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    const needsBranch = true;

    if (needsBranch && (!data.branchId || !String(data.branchId).trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "branchId is required for earn/redeem.",
        path: ["branchId"],
      });
    }
  });

const listPointsTxSchema = z.object({
  membershipId: z.string().uuid().optional(),
  type: z.enum(["earn", "adjust", "redeem"]).optional(),
  branchId: z.string().uuid().optional(),
  operatorUserId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

module.exports = {
  createPointsTxSchema,
  listPointsTxSchema,
};
