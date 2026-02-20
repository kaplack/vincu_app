// src/routes/reward.routes.js
const express = require("express");

const { requireAuth } = require("../middlewares/auth.middleware");
const {
  requireBusinessMember,
} = require("../middlewares/businessAccess.middleware");

const { validate } = require("../middlewares/validate.middleware");

const rewardController = require("../controllers/reward.controller");
const {
  createRewardSchema,
  updateRewardSchema,
} = require("../validators/reward.validator");

const router = express.Router();

// List rewards (include inactive/archived depending on query; definimos en validator luego)
router.get(
  "/",
  requireAuth,
  requireBusinessMember,
  rewardController.listRewards,
);

// Create
router.post(
  "/",
  requireAuth,
  requireBusinessMember,
  validate(createRewardSchema),
  rewardController.createReward,
);

// Update (name/description/pointsRequired/isActive/isArchived)
router.patch(
  "/:rewardId",
  requireAuth,
  requireBusinessMember,
  validate(updateRewardSchema),
  rewardController.updateReward,
);

// Archive (soft delete)
router.post(
  "/:rewardId/archive",
  requireAuth,
  requireBusinessMember,
  rewardController.archiveReward,
);

// Delete (hard delete) - service debería bloquear si tiene historial
router.delete(
  "/:rewardId",
  requireAuth,
  requireBusinessMember,
  rewardController.deleteReward,
);

module.exports = router;
