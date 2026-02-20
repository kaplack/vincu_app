// src/routes/redemption.routes.js
const express = require("express");
const { HttpError } = require("../utils/httpError");
const { requireAuth } = require("../middlewares/auth.middleware");
const {
  requireBusinessMember,
} = require("../middlewares/businessAccess.middleware");

const { validate } = require("../middlewares/validate.middleware");

// Controllers (los crearemos luego)
const redemptionController = require("../controllers/redemption.controller");

// Zod validators (los crearemos luego)
const {
  consumeRedemptionSchema,
  cancelRedemptionSchema,
  listRedemptionsSchema,
} = require("../validators/redemption.validator");

const router = express.Router();

// Middleware to require branchId from body or headers
function requireBranchId(req, _res, next) {
  const branchId =
    req.body?.branchId ||
    req.headers["x-branch-id"] ||
    req.headers["x-branchid"] ||
    null;

  if (!branchId) {
    return next(new HttpError(400, "branchId is required.", "BRANCH_REQUIRED"));
  }

  // lo guardamos para controller/service
  req.selectedBranchId = String(branchId);
  // y si el endpoint valida body, aseguramos que pase el validator
  if (req.body && !req.body.branchId) req.body.branchId = String(branchId);

  next();
}

/**
 * Redemptions (Business panel: Canjes)
 * Base: /api/redemptions
 *
 * Permissions:
 * - Owner/Manager/Operator can consume + cancel (as you decided)
 */

// List redemptions (pending/confirmed/cancelled) with optional search
router.get(
  "/",
  requireAuth,
  requireBusinessMember,
  validate(listRedemptionsSchema),
  redemptionController.listRedemptions,
);

// Consume (confirm) redemption by redeemCode
router.post(
  "/consume",
  requireAuth,
  requireBusinessMember,
  requireBranchId,
  validate(consumeRedemptionSchema),
  redemptionController.consumeRedemption,
);

// Cancel redemption by redeemCode (requires reason)
router.post(
  "/cancel",
  requireAuth,
  requireBusinessMember,
  requireBranchId,
  validate(cancelRedemptionSchema),
  redemptionController.cancelRedemption,
);

module.exports = router;
