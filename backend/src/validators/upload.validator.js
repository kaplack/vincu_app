// src/validators/upload.validator.js
const { z } = require("zod");

const presignRewardImageSchema = z.object({
  body: z.object({
    mimeType: z.enum(["image/jpeg", "image/png"]),
    fileSize: z.number().int().positive().optional(),
  }),
  params: z.object({
    rewardId: z.string().uuid(),
  }),
  query: z.object({}).optional(),
});

module.exports = { presignRewardImageSchema };
