// backend/src/routes/business.routes.js
const router = require("express").Router();

const businessController = require("../controllers/business.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const { validateBody } = require("../middlewares/validate.middleware");
const {
  requireBusinessMember,
  requireBusinessOwner,
} = require("../middlewares/businessAccess.middleware");

const {
  createBusinessSchema,
  createBranchSchema,
  updateBusinessSchema,
  inviteUserSchema,
  updateMemberSchema,
} = require("../validators/business.validators");

// ✅ Listar negocios (árbol flatten)
router.get("/", requireAuth, businessController.listBusinesses);

// ✅ Crear negocio principal (owner)
router.post(
  "/",
  requireAuth,
  validateBody(createBusinessSchema),
  businessController.createBusiness,
);

// ✅ Crear sucursal (solo OWNER o SUPERADMIN)
router.post(
  "/:businessId/branches",
  requireAuth,
  requireBusinessMember,
  requireBusinessOwner,
  validateBody(createBranchSchema),
  businessController.createBranch,
);

// ✅ Actualizar negocio/sucursal (solo OWNER o SUPERADMIN)
router.patch(
  "/:businessId",
  requireAuth,
  requireBusinessMember,
  requireBusinessOwner,
  validateBody(updateBusinessSchema),
  businessController.updateBusiness,
);

// ------- lo que ya tenías (users/invitations) -------
// Listar usuarios de un negocio
// GET /api/businesses/:businessId/users
router.get("/:businessId/users", requireAuth, businessController.listUsers);

// Invitar usuario a negocio
// POST /api/businesses/:businessId/invitations
router.post(
  "/:businessId/invitations",
  requireAuth,
  validateBody(inviteUserSchema),
  businessController.invite,
);

router.patch(
  "/:businessId/users/:userId",
  requireAuth,
  validateBody(updateMemberSchema),
  businessController.updateUser,
);

router.delete(
  "/:businessId/users/:userId",
  requireAuth,
  businessController.removeUser,
);

module.exports = router;
