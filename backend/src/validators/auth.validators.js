const { z } = require("zod");

const registerSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    email: z.string().trim().email().max(180).optional().or(z.literal("")).transform((v)=> (v === "" ? undefined : v)),
    phone: z.string().trim().min(7).max(32).optional().or(z.literal("")).transform((v)=> (v === "" ? undefined : v)),
    password: z.string().min(8).max(128),
  })
  .refine((data) => data.email || data.phone, {
    message: "Email or phone is required.",
    path: ["email"],
  });

const loginSchema = z.object({
  identifier: z.string().trim().min(3).max(180),
  password: z.string().min(8).max(128),
});

module.exports = { registerSchema, loginSchema };
