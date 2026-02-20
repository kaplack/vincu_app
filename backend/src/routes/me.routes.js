// backend/src/routes/me.routes.js
const router = require("express").Router();

const ctrl = require("../controllers/me.controller");
const { requireCustomer } = require("../middlewares/customerAuth.middleware");
const {
  validateParams,
  validateBody,
} = require("../middlewares/validate.middleware");
const {
  membershipIdParamsSchema,
  businessIdParamsSchema,
  createRedemptionBodySchema,
  redemptionIdParamsSchema,
} = require("../validators/me.validators");

router.use(requireCustomer);

// Mis tarjetas
router.get("/memberships", ctrl.listMemberships);

// Historial
router.get(
  "/memberships/:membershipId/transactions",
  validateParams(membershipIdParamsSchema),
  ctrl.listMembershipTransactions,
);

// Catálogo
router.get(
  "/businesses/:businessId/rewards",
  validateParams(businessIdParamsSchema),
  ctrl.listBusinessRewards,
);

// Emitir canje
router.post(
  "/redemptions",
  validateBody(createRedemptionBodySchema),
  ctrl.createRedemption,
);

// Detalle de canje
router.get(
  "/redemptions/:redemptionId",
  validateParams(redemptionIdParamsSchema),
  ctrl.getRedemptionById,
);

module.exports = router;
