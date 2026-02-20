// backend/src/routes/invitation.routes.js
const router = require("express").Router();

const invitationController = require("../controllers/invitation.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

// get invitation by token
// GET api/invitations/:token
router.get("/:token", invitationController.getByToken);

// accept invitation
// POST api/invitations/:token/accept
router.post("/:token/accept", requireAuth, invitationController.accept);

module.exports = router;
