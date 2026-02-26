// backend/src/validators/publicLoyalty.validator.js
const { z } = require("zod");

// JOIN lite: solo teléfono (+ alias opcional)
const joinLiteBodySchema = z.object({
  phone: z.string().min(1, "phone is required").max(20),
  firstName: z.string().max(80).optional(),
});

module.exports = {
  joinLiteBodySchema,
};
