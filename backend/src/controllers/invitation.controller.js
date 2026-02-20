// backend/src/controllers/invitation.controller.js
const invitationService = require("../services/invitation.service");

// GET /invitations/:token
async function getByToken(req, res, next) {
  try {
    const { token } = req.params;
    const result = await invitationService.getInvitationByToken(token);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

// POST /invitations/:token/accept
// Accept invitation
async function accept(req, res, next) {
  try {
    const { token } = req.params;
    const result = await invitationService.acceptInvitation(token, req.user);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { accept, getByToken };
