// backend/src/validators/publicLoyalty.validator.js
const { z } = require("zod");

const joinBySlugBodySchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  documentNumber: z.string().min(6).max(20),
  phone: z.string().min(6).max(20),
});

const consultaLoginBodySchema = z.object({
  phone: z.string().min(6).max(20),
  documentNumber: z.string().min(6).max(20),
});

module.exports = {
  joinBySlugBodySchema,
  consultaLoginBodySchema,
};
