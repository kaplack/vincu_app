const { z } = require("zod");

const setCurrentBusinessSchema = z.object({
  currentBusinessId: z.string().uuid().nullable(),
});

module.exports = { setCurrentBusinessSchema };
