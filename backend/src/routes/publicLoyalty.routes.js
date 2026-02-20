// backend/src/routes/publicLoyalty.routes.js

const router = require("express").Router();

const ctrl = require("../controllers/publicLoyalty.controller");
const { requireCustomer } = require("../middlewares/customerAuth.middleware");
const { validateBody } = require("../middlewares/validate.middleware");

const {
  joinBySlugBodySchema,
  consultaLoginBodySchema,
} = require("../validators/publicLoyalty.validator");

router.post("/join/:slug", validateBody(joinBySlugBodySchema), ctrl.joinBySlug);

router.post(
  "/consulta/login",
  validateBody(consultaLoginBodySchema),
  ctrl.consultaLogin,
);

router.get("/consulta/cards", requireCustomer, ctrl.consultaCards);
router.get("/c/:token", ctrl.getByPublicToken);

module.exports = router;
