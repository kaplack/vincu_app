const router = require("express").Router();

const authController = require("../controllers/auth.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const { validateBody } = require("../middlewares/validate.middleware");
const { registerSchema, loginSchema } = require("../validators/auth.validators");

router.post("/register", validateBody(registerSchema), authController.register);
router.post("/login", validateBody(loginSchema), authController.login);
router.get("/me", requireAuth, authController.me);

module.exports = router;
