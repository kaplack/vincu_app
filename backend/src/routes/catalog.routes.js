// src/routes/catalog.routes.js
const express = require("express");
const { validate } = require("../middlewares/validate.middleware");

// Customer auth middleware (ya lo tienes en tu backend)
const { requireCustomer } = require("../middlewares/customerAuth.middleware");

const catalogController = require("../controllers/catalog.controller");
const {
  listCatalogRewardsSchema,
  createCatalogRedemptionSchema,
} = require("../validators/catalog.validator");

const router = express.Router();

/**
 * Catalog (customer-facing)
 * Base: /api/catalog
 */

// List active rewards for a business slug
router.get(
  "/:businessSlug/rewards",
  validate(listCatalogRewardsSchema),
  catalogController.listActiveRewards,
);

// Customer creates a redemption (Opción A: descuenta puntos y devuelve redeemCode)
router.post(
  "/:businessSlug/redemptions",
  requireCustomer,
  validate(createCatalogRedemptionSchema),
  catalogController.createRedemption,
);

module.exports = router;
