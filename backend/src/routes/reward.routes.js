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
  addRewardImageSchema,
  removeRewardImageSchema,
  setRewardThumbnailSchema,
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

// Add image (max 3). Optionally set as thumbnail.
router.post(
  "/:rewardId/images",
  requireAuth,
  requireBusinessMember,
  validate(addRewardImageSchema),
  rewardController.addRewardImage,
);

// Set thumbnail (must be one of images)
router.post(
  "/:rewardId/thumbnail",
  requireAuth,
  requireBusinessMember,
  validate(setRewardThumbnailSchema),
  rewardController.setRewardThumbnail,
);

// Remove image (if it was thumbnail, backend reassigns)
router.delete(
  "/:rewardId/images",
  requireAuth,
  requireBusinessMember,
  validate(removeRewardImageSchema),
  rewardController.removeRewardImage,
);

module.exports = router;
