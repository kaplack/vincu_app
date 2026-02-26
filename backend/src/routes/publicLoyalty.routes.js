// backend/src/routes/publicLoyalty.routes.js

const router = require("express").Router();

const ctrl = require("../controllers/publicLoyalty.controller");
const { validateBody } = require("../middlewares/validate.middleware");
const {
  rateLimitPublic,
} = require("../middlewares/rateLimitPublic.middleware");

const { joinLiteBodySchema } = require("../validators/publicLoyalty.validator");

// JOIN público (sin auth)
router.post(
  "/join/:slug",
  rateLimitPublic({ windowMs: 60_000, max: 10 }),
  validateBody(joinLiteBodySchema),
  ctrl.joinLite,
);

// Consulta pública por token (se queda para 0-tech)
router.get("/c/:token", ctrl.getByPublicToken);

module.exports = router;
