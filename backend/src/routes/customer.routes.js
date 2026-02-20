// backend/src/routes/customer.routes.js
const router = require("express").Router();

const customerController = require("../controllers/customer.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const {
  requireBusinessMember,
} = require("../middlewares/businessAccess.middleware");
const { validateParams } = require("../middlewares/validate.middleware");
const customerValidators = require("../validators/customer.validators");

// List (tabla)
router.get("/", requireAuth, requireBusinessMember, customerController.list);

// Detail (modal)
router.get(
  "/:membershipId",
  requireAuth,
  requireBusinessMember,
  validateParams(customerValidators.membershipIdParams),
  customerController.getByMembershipId,
);

// QR lookup (scanner / wallet)
router.get(
  "/qr/:qrToken",
  requireAuth,
  requireBusinessMember,
  validateParams(customerValidators.qrTokenParams),
  customerController.getByQrToken,
);

// Transactions (historial)
router.get(
  "/:membershipId/transactions",
  requireAuth,
  requireBusinessMember,
  validateParams(customerValidators.membershipIdParams),
  customerController.listTransactions,
);

module.exports = router;
