// backend/src/controllers/business.controller.js
const businessService = require("../services/business.service");
const invitationService = require("../services/invitation.service");

async function createBusiness(req, res, next) {
  try {
    const business = await businessService.createBusiness(req.body, req.user);
    res.status(201).json({ business });
  } catch (err) {
    next(err);
  }
}

async function listBusinesses(req, res, next) {
  try {
    const items = await businessService.listBusinessesForUser(req.user);
    res.status(200).json({ items });
  } catch (err) {
    next(err);
  }
}

async function createBranch(req, res, next) {
  try {
    const { businessId } = req.params; // principal id
    const branch = await businessService.createBranch(
      businessId,
      req.body,
      req.user,
    );
    res.status(201).json({ branch });
  } catch (err) {
    next(err);
  }
}

async function updateBusiness(req, res, next) {
  try {
    const { businessId } = req.params;
    const business = await businessService.updateBusiness(
      businessId,
      req.body,
      req.user,
    );
    res.status(200).json({ business });
  } catch (err) {
    next(err);
  }
}

async function listUsers(req, res, next) {
  try {
    const { businessId } = req.params;
    const members = await businessService.listBusinessUsers(
      businessId,
      req.user,
    );
    const invitations = await invitationService.listInvitations(
      businessId,
      req.user,
    );
    res.status(200).json({ members, invitations });
  } catch (err) {
    next(err);
  }
}

async function invite(req, res, next) {
  console.log("invite controller called with:", req.params, req.body);
  try {
    const { businessId } = req.params;
    const invitation = await invitationService.createInvitation(
      businessId,
      req.body,
      req.user,
    );
    res.status(201).json({ invitation });
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const { businessId, userId } = req.params;
    const membership = await businessService.updateMember(
      businessId,
      userId,
      req.body,
      req.user,
    );
    res.status(200).json({ membership });
  } catch (err) {
    next(err);
  }
}

async function removeUser(req, res, next) {
  try {
    const { businessId, userId } = req.params;
    const result = await businessService.removeMember(
      businessId,
      userId,
      req.user,
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createBusiness,
  listBusinesses,
  createBranch,
  updateBusiness,
  listUsers,
  invite,
  updateUser,
  removeUser,
};
