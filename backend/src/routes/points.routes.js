// backend/src/routes/points.routes.js
const express = require("express");
const pointsController = require("../controllers/points.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const {
  requireBusinessMember,
} = require("../middlewares/businessAccess.middleware");
const {
  validateBody,
  validateQuery,
} = require("../middlewares/validate.middleware");
const {
  createPointsTxSchema,
  listPointsTxSchema,
} = require("../validators/points.validators");

const router = express.Router();

// All points operations require auth + business context
router.use(requireAuth, requireBusinessMember);

// GET /api/points
router.get("/", validateQuery(listPointsTxSchema), pointsController.list);

// POST /api/points
router.post("/", validateBody(createPointsTxSchema), pointsController.create);

module.exports = router;
