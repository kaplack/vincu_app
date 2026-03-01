// src/routes/upload.routes.js
const express = require("express");
const { requireAuth } = require("../middlewares/auth.middleware");
const {
  requireBusinessMember,
} = require("../middlewares/businessAccess.middleware");
const { validate } = require("../middlewares/validate.middleware");

const uploadController = require("../controllers/upload.controller");
const { presignRewardImageSchema } = require("../validators/upload.validator");

const router = express.Router();

router.post(
  "/rewards/:rewardId/presign",
  requireAuth,
  requireBusinessMember,
  validate(presignRewardImageSchema),
  uploadController.presignRewardImage,
);

module.exports = router;
