// backend/src/validators/business.validators.js
const { z } = require("zod");
const { BUSINESS_ROLES } = require("../constants/businessRoles");
const { MEMBERSHIP_STATUS } = require("../constants/membershipStatus");

// ✅ Crear negocio principal (planKey lo setea backend = "free")
const createBusinessSchema = z.object({
  commercialName: z.string().trim().min(2).max(120),

  // Opcionales (pueden venir vacíos o no venir)
  legalName: z.string().trim().min(2).max(180).optional().nullable(),
  category: z.string().trim().min(2).max(80).optional().nullable(),
});

// ✅ Crear sucursal (ubigeo opcional)
const createBranchSchema = z.object({
  commercialName: z.string().trim().min(2).max(120),
  address: z.string().trim().min(2).max(220),
  phone: z.string().trim().max(40).optional().nullable(),
  isActive: z.boolean().optional(),

  // ubigeo opcional
  departamento: z.string().trim().max(80).optional().nullable(),
  provincia: z.string().trim().max(80).optional().nullable(),
  distrito: z.string().trim().max(80).optional().nullable(),
  ubigeoId: z.string().trim().max(12).optional().nullable(),
});

// ✅ Actualizar negocio (principal o sucursal)
// Nota: la restricción de qué campos puede editar una sucursal la haremos en service/controller.
const updateBusinessSchema = z
  .object({
    commercialName: z.string().trim().min(2).max(120).optional(),
    legalName: z.string().trim().min(2).max(180).optional(),
    category: z.string().trim().min(2).max(80).optional(),

    businessUrl: z.string().trim().max(240).optional().nullable(),
    email: z.string().trim().email().max(180).optional().nullable(),
    phone: z.string().trim().max(40).optional().nullable(),
    address: z.string().trim().max(220).optional().nullable(),

    ruc: z.string().trim().max(20).optional().nullable(),

    departamento: z.string().trim().max(80).optional().nullable(),
    provincia: z.string().trim().max(80).optional().nullable(),
    distrito: z.string().trim().max(80).optional().nullable(),
    ubigeoId: z.string().trim().max(12).optional().nullable(),

    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required.",
  });

const inviteUserSchema = z.object({
  email: z.string().trim().email().max(180),
  role: z
    .string()
    .transform((v) => v.toUpperCase())
    .pipe(
      z.enum([
        BUSINESS_ROLES.OWNER,
        BUSINESS_ROLES.MANAGER,
        BUSINESS_ROLES.OPERATOR,
      ]),
    ),
});

const updateMemberSchema = z
  .object({
    role: z.enum([BUSINESS_ROLES.OWNER, BUSINESS_ROLES.MANAGER]).optional(),
    status: z
      .enum([
        MEMBERSHIP_STATUS.ACTIVE,
        MEMBERSHIP_STATUS.SUSPENDED,
        MEMBERSHIP_STATUS.INVITED,
      ])
      .optional(),
  })
  .refine((data) => data.role || data.status, {
    message: "At least one field (role or status) is required.",
  });

module.exports = {
  createBusinessSchema,
  createBranchSchema,
  updateBusinessSchema,
  inviteUserSchema,
  updateMemberSchema,
};
