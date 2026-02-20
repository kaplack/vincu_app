// backend/src/services/invitation.service.js
const crypto = require("crypto");
const { sequelize } = require("../config/db");
const { BUSINESS_ROLES } = require("../constants/businessRoles");
const { MEMBERSHIP_STATUS } = require("../constants/membershipStatus");
const { INVITATION_STATUS } = require("../constants/invitationStatus");
const { normalizeEmail } = require("../utils/normalize");
const { HttpError } = require("../utils/httpError");

function randomToken() {
  return crypto.randomBytes(24).toString("hex"); // 48 chars
}

async function createInvitation(businessId, { email, role }, user) {
  const Invitation = sequelize.models.Invitation;
  const BusinessUser = sequelize.models.BusinessUser;
  const UserModel = sequelize.models.User;

  // Permission check: who can invite and what roles can be invited
  const inviterMembership = await BusinessUser.findOne({
    where: { businessId, userId: user.id, status: MEMBERSHIP_STATUS.ACTIVE },
  });

  if (!inviterMembership) {
    throw new HttpError(403, "Not a business member.", "BIZ_NOT_MEMBER");
  }

  const inviterRole = inviterMembership.role;

  // Normalize role input
  const requestedRole = String(role || "").toUpperCase();

  const allowedByRole = {
    [BUSINESS_ROLES.OWNER]: new Set([
      BUSINESS_ROLES.MANAGER,
      BUSINESS_ROLES.OPERATOR,
    ]),
    [BUSINESS_ROLES.MANAGER]: new Set([BUSINESS_ROLES.OPERATOR]),
    [BUSINESS_ROLES.OPERATOR]: new Set([]),
  };

  const allowed = allowedByRole[inviterRole] || new Set();

  if (!allowed.has(requestedRole)) {
    throw new HttpError(
      403,
      "You are not allowed to invite this role.",
      "INV_ROLE_FORBIDDEN",
    );
  }

  const normalizedEmail = normalizeEmail(email);

  // If the user already is a member, block.
  const existingUser = await UserModel.findOne({
    where: { email: normalizedEmail },
  });
  if (existingUser) {
    const existingMembership = await BusinessUser.findOne({
      where: { businessId, userId: existingUser.id },
    });
    if (existingMembership) {
      throw new HttpError(
        409,
        "User is already a member of this business.",
        "INV_ALREADY_MEMBER",
      );
    }
  }

  const pending = await Invitation.findOne({
    where: {
      businessId,
      email: normalizedEmail,
      status: INVITATION_STATUS.PENDING,
    },
  });
  if (pending) {
    throw new HttpError(
      409,
      "There is already a pending invitation for this email.",
      "INV_ALREADY_PENDING",
    );
  }

  const token = randomToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const inv = await Invitation.create({
    businessId,
    email: normalizedEmail,
    role: requestedRole,
    status: INVITATION_STATUS.PENDING,
    token,
    invitedByUserId: user.id,
    invitedAt: new Date(),
    expiresAt,
  });

  // For now we just return the token (later: send email).
  return {
    id: inv.id,
    businessId: inv.businessId,
    email: inv.email,
    role: inv.role,
    status: inv.status,
    token: inv.token,
    expiresAt: inv.expiresAt,
  };
}

async function acceptInvitation(token, user) {
  const Invitation = sequelize.models.Invitation;
  const BusinessUser = sequelize.models.BusinessUser;

  const inv = await Invitation.findOne({ where: { token } });
  if (!inv) throw new HttpError(404, "Invitation not found.", "INV_NOT_FOUND");

  if (inv.status !== INVITATION_STATUS.PENDING) {
    throw new HttpError(400, "Invitation is not pending.", "INV_NOT_PENDING");
  }

  if (new Date(inv.expiresAt).getTime() < Date.now()) {
    inv.status = INVITATION_STATUS.EXPIRED;
    await inv.save();
    throw new HttpError(400, "Invitation has expired.", "INV_EXPIRED");
  }

  if (!user.email) {
    throw new HttpError(
      400,
      "Your account has no email set; cannot accept invitation.",
      "INV_NO_EMAIL",
    );
  }
  if (normalizeEmail(user.email) !== normalizeEmail(inv.email)) {
    throw new HttpError(
      403,
      "This invitation is for a different email.",
      "INV_EMAIL_MISMATCH",
    );
  }

  // Create membership
  await BusinessUser.create({
    businessId: inv.businessId,
    userId: user.id,
    role: inv.role,
    status: MEMBERSHIP_STATUS.ACTIVE,
    invitedByUserId: inv.invitedByUserId,
    invitedAt: inv.invitedAt,
    acceptedAt: new Date(),
  });

  inv.status = INVITATION_STATUS.ACCEPTED;
  inv.acceptedByUserId = user.id;
  inv.acceptedAt = new Date();
  await inv.save();

  if (!user.currentBusinessId) {
    user.currentBusinessId = inv.businessId;
    await user.save();
  }

  return { ok: true, businessId: inv.businessId, role: inv.role };
}

async function listInvitations(businessId, user) {
  const Invitation = sequelize.models.Invitation;

  const invitations = await Invitation.findAll({
    where: { businessId, status: INVITATION_STATUS.PENDING },
    order: [["createdAt", "DESC"]],
  });

  return invitations.map((i) => ({
    id: i.id,
    email: i.email,
    role: i.role,
    status: i.status,
    expiresAt: i.expiresAt,
    token: i.token,
    invitedAt: i.invitedAt,
  }));
}

async function getInvitationByToken(token) {
  const Invitation = sequelize.models.Invitation;
  const Business = sequelize.models.Business;

  const inv = await Invitation.findOne({ where: { token } });
  if (!inv) throw new HttpError(404, "Invitation not found.", "INV_NOT_FOUND");

  // Auto-expire if needed
  if (
    inv.status === INVITATION_STATUS.PENDING &&
    inv.expiresAt &&
    new Date(inv.expiresAt).getTime() < Date.now()
  ) {
    inv.status = INVITATION_STATUS.EXPIRED;
    await inv.save();
  }

  const business = await Business.findByPk(inv.businessId);

  return {
    token: inv.token,
    businessId: inv.businessId,
    businessName: business?.commercialName || null,
    email: inv.email,
    role: inv.role,
    status: inv.status,
    expiresAt: inv.expiresAt,
    invitedAt: inv.invitedAt,
  };
}

module.exports = {
  createInvitation,
  acceptInvitation,
  listInvitations,
  getInvitationByToken,
};
