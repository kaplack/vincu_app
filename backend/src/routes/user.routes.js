const router = require("express").Router();

const userController = require("../controllers/user.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const { validateBody } = require("../middlewares/validate.middleware");
const { setCurrentBusinessSchema } = require("../validators/user.validators");

// PATCH /users/me/current-business
// Set the current business for the authenticated user
router.patch(
  "/me/current-business",
  requireAuth,
  validateBody(setCurrentBusinessSchema),
  userController.setCurrentBusinessController,
);

module.exports = router;
