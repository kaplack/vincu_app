// backend/src/routes/index.js

const router = require("express").Router();

router.use("/auth", require("./auth.routes"));
router.use("/businesses", require("./business.routes"));
router.use("/invitations", require("./invitation.routes"));
router.use("/users", require("./user.routes"));
router.use("/wallet-card", require("./walletCard.routes"));
router.use("/public", require("./publicLoyalty.routes"));
router.use("/customers", require("./customer.routes"));
router.use("/points", require("./points.routes"));
router.use("/rewards", require("./reward.routes"));
router.use("/redemptions", require("./redemption.routes"));
router.use("/catalog", require("./catalog.routes"));
router.use("/me", require("./me.routes"));

module.exports = router;
