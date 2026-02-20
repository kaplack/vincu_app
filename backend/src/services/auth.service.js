// backend/src/services/auth.service.js
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const { sequelize } = require("../config/db");
const { ROLES } = require("../constants/roles");
const { signAccessToken } = require("../utils/jwt");
const { normalizeEmail, normalizePhonePE } = require("../utils/normalize");
const { HttpError } = require("../utils/httpError");

function toUserDTO(u) {
  return {
    id: u.id,
    name: u.name,
    lastName: u.lastName,
    email: u.email,
    phone: u.phone,
    role: u.role, // global role (USER | SUPERADMIN)
    currentBusinessId: u.currentBusinessId,
  };
}

async function listBusinessesForUser(userId) {
  const BusinessUser = sequelize.models.BusinessUser;
  const Business = sequelize.models.Business;

  const memberships = await BusinessUser.findAll({
    where: { userId },
    include: [{ model: Business, as: "business" }],
    order: [["createdAt", "ASC"]],
  });

  return memberships.map((m) => ({
    businessId: m.businessId,
    name: m.business?.name,
    planKey: m.business?.planKey,
    role: m.role,
    status: m.status,
  }));
}

function needsBusinessSetup(user, businesses) {
  // If user belongs to no businesses, they need to create or join one.
  return businesses.length === 0;
}

async function register(payload) {
  const name = payload.name.trim();
  const lastName = payload.lastName.trim();
  const email = payload.email ? normalizeEmail(payload.email) : null;
  const phone = payload.phone ? normalizePhonePE(payload.phone) : null;

  if (email) {
    const exists = await sequelize.models.User.findOne({ where: { email } });
    if (exists)
      throw new HttpError(409, "Email already in use.", "AUTH_EMAIL_EXISTS");
  }
  if (phone) {
    const exists = await sequelize.models.User.findOne({ where: { phone } });
    if (exists)
      throw new HttpError(409, "Phone already in use.", "AUTH_PHONE_EXISTS");
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);

  const user = await sequelize.models.User.create({
    name,
    lastName,
    email,
    phone,
    passwordHash,
    role: ROLES.USER,
    currentBusinessId: null,
  });

  const token = signAccessToken({ sub: user.id, role: user.role });

  return {
    token,
    user: toUserDTO(user),
    businesses: [],
    needsBusinessSetup: true,
  };
}

async function login(payload) {
  const identifierRaw = payload.identifier.trim();
  const isEmail = identifierRaw.includes("@");

  const where = isEmail
    ? { email: normalizeEmail(identifierRaw) }
    : { phone: normalizePhonePE(identifierRaw) };

  const user = await sequelize.models.User.findOne({ where });
  if (!user)
    throw new HttpError(
      401,
      "Invalid credentials.",
      "AUTH_INVALID_CREDENTIALS",
    );

  const ok = await bcrypt.compare(payload.password, user.passwordHash);
  if (!ok)
    throw new HttpError(
      401,
      "Invalid credentials.",
      "AUTH_INVALID_CREDENTIALS",
    );

  const businesses = await listBusinessesForUser(user.id);

  // If currentBusinessId is empty but user has businesses, default to the first ACTIVE one.
  if (!user.currentBusinessId && businesses.length > 0) {
    const firstActive =
      businesses.find((b) => b.status === "ACTIVE") || businesses[0];
    if (firstActive?.businessId) {
      user.currentBusinessId = firstActive.businessId;
      await user.save();
    }
  }

  const token = signAccessToken({ sub: user.id, role: user.role });

  return {
    token,
    user: toUserDTO(user),
    businesses,
    needsBusinessSetup: needsBusinessSetup(user, businesses),
  };
}

async function me(userInstance) {
  const businesses = await listBusinessesForUser(userInstance.id);

  return {
    user: toUserDTO(userInstance),
    businesses,
    needsBusinessSetup: needsBusinessSetup(userInstance, businesses),
  };
}

module.exports = { register, login, me };
