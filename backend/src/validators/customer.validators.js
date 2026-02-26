// backend/src/validators/customer.validators.js
const { z } = require("zod");

const membershipIdParams = z.object({
  membershipId: z.string().uuid("Invalid membershipId."),
});

const qrTokenParams = z.object({
  qrToken: z.string().min(10, "Invalid qrToken."),
});

const createCustomerBody = z.object({
  phone: z.string().min(9, "phone is required").max(20),
  firstName: z.string().max(80).optional(),
});

module.exports = {
  membershipIdParams,
  qrTokenParams,
  createCustomerBody,
};
