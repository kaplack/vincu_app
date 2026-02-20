// backend/src/routes/walletCard.routes.js
const router = require("express").Router();
const controller = require("../controllers/walletCard.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

router.get("/", requireAuth, controller.getMyWalletCard);
router.get("/affiliation", requireAuth, controller.getAffiliation);
router.put("/branding", requireAuth, controller.updateBranding);

module.exports = router;
