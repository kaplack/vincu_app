// backend/src/validators/customer.validators.js
const { z } = require("zod");

const membershipIdParams = z.object({
  membershipId: z.string().uuid("Invalid membershipId."),
});

const qrTokenParams = z.object({
  qrToken: z.string().min(10, "Invalid qrToken."),
});

module.exports = {
  membershipIdParams,
  qrTokenParams,
};
