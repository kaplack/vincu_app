// backend/src/routes/walletCard.routes.js
const router = require("express").Router();
const controller = require("../controllers/walletCard.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

// index.js: router.use("/wallet-card", require("./walletCard.routes"));

router.get("/", requireAuth, controller.getMyWalletCard);
router.get("/affiliation", requireAuth, controller.getAffiliation);
router.put("/branding", requireAuth, controller.updateBranding);

// ✅ Público: post-join -> save to wallet
router.get("/c/:token/save", controller.getSaveUrlByPublicToken);

module.exports = router;
