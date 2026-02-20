// backend/src/services/business.service.js
const { Op } = require("sequelize");
const { sequelize } = require("../config/db");
const { BUSINESS_ROLES } = require("../constants/businessRoles");
const { MEMBERSHIP_STATUS } = require("../constants/membershipStatus");
const { HttpError } = require("../utils/httpError");
const { generateUniqueBusinessSlug } = require("../utils/slug");

function isSuperAdmin(user) {
  return String(user?.role || "").toUpperCase() === "SUPERADMIN";
}

/**
 * Create principal business + auto-create main branch.
 * - planKey is per principal business; default "free" ALWAYS on create
 * - Always creates 1 branch: "<commercialName> - Principal"
 */
async function createBusiness({ commercialName, legalName, category }, user) {
  const Business = sequelize.models.Business;
  const BusinessUser = sequelize.models.BusinessUser;

  const safeTrim = (v) => (typeof v === "string" ? v.trim() : "");

  const commercialNameTrim = safeTrim(commercialName);
  const legalNameTrim = safeTrim(legalName);
  const categoryTrim = safeTrim(category);

  if (!commercialNameTrim) {
    throw new HttpError(
      400,
      "commercialName is required.",
      "BIZ_COMMERCIAL_NAME_REQUIRED",
    );
  }
  if (!categoryTrim) {
    throw new HttpError(400, "category is required.", "BIZ_CATEGORY_REQUIRED");
  }

  const result = await sequelize.transaction(async (t) => {
    // 1) Principal business (with auto-generated slug)
    const slug = await generateUniqueBusinessSlug({
      commercialName: commercialNameTrim,
      BusinessModel: Business,
      transaction: t,
    });

    const business = await Business.create(
      {
        parentId: null,
        commercialName: commercialNameTrim,
        legalName: legalNameTrim || null,
        category: categoryTrim,
        planKey: "free",
        slug, // ✅ aquí
        isActive: true,
      },
      { transaction: t },
    );

    // 2) Auto-create main branch
    const mainBranch = await Business.create(
      {
        parentId: business.id,
        commercialName: `${business.commercialName} - Principal`,
        address: null,
        phone: null,
        isActive: true,
        departamento: null,
        provincia: null,
        distrito: null,
        ubigeoId: null,
        slug: null,
        // Keep these null on branches (model soft-rules)
        legalName: null,
        ruc: null,
        businessUrl: null,
        email: null,
        category: null,
        planKey: business.planKey, // optional; not used for branch checks
      },
      { transaction: t },
    );

    // 3) Owner membership (principal)
    await BusinessUser.create(
      {
        businessId: business.id,
        userId: user.id,
        role: BUSINESS_ROLES.OWNER,
        status: MEMBERSHIP_STATUS.ACTIVE,
        acceptedAt: new Date(),
      },
      { transaction: t },
    );

    // 4) Set current business (optional)
    if (!user.currentBusinessId) {
      user.currentBusinessId = business.id;
      await user.save({ transaction: t });
    }

    return { business, mainBranch };
  });

  // Puedes devolver solo business si no quieres cambiar el controller/FE:
  // return result.business;

  // Recomendado (para FE): devolver ambos
  return result;
}

/**
 * List businesses (principal + branches) for current user.
 * - USER: principals where ACTIVE member + branches of those principals
 * - SUPERADMIN: all principals + branches
 * Returns flat list for frontend tree.
 */
async function listBusinessesForUser(user) {
  const Business = sequelize.models.Business;
  const BusinessUser = sequelize.models.BusinessUser;

  let principals = [];
  let memberships = [];
  let membershipByBusinessId = new Map();

  if (isSuperAdmin(user)) {
    principals = await Business.findAll({
      where: { parentId: null },
      order: [["createdAt", "ASC"]],
    });
  } else {
    memberships = await BusinessUser.findAll({
      where: { userId: user.id, status: MEMBERSHIP_STATUS.ACTIVE },
      attributes: ["businessId", "role", "branchId"],
    });

    membershipByBusinessId = new Map(
      memberships.map((m) => [
        m.businessId,
        { role: m.role, branchId: m.branchId },
      ]),
    );

    const principalIds = memberships.map((m) => m.businessId);

    principals = principalIds.length
      ? await Business.findAll({
          where: { id: { [Op.in]: principalIds }, parentId: null },
          order: [["createdAt", "ASC"]],
        })
      : [];
  }

  const principalIds = principals.map((p) => p.id);

  const branches = principalIds.length
    ? await Business.findAll({
        where: { parentId: { [Op.in]: principalIds } },
        order: [["createdAt", "ASC"]],
      })
    : [];

  const principalById = new Map(principals.map((p) => [p.id, p]));

  // Flatten response + category inheritance for branches
  const items = [
    ...principals.map((p) => {
      const mem = membershipByBusinessId.get(p.id);
      return {
        id: p.id,
        parentId: p.parentId,
        commercialName: p.commercialName,
        legalName: p.legalName,
        category: p.category,
        planKey: p.planKey,
        isActive: p.isActive,
        email: p.email ?? null,
        phone: p.phone ?? null,
        address: p.address ?? null,
        businessUrl: p.businessUrl ?? null,
        ruc: p.ruc ?? null,
        departamento: p.departamento ?? null,
        provincia: p.provincia ?? null,
        distrito: p.distrito ?? null,
        ubigeoId: p.ubigeoId ?? null,
        slug: p.slug ?? null,

        // membership for current user (null for superadmin unless you decide otherwise)
        membershipRole: mem?.role ?? null,
        membershipBranchId: mem?.branchId ?? null,

        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    }),

    ...branches.map((b) => {
      const parent = principalById.get(b.parentId);

      // Inherit membership from parent principal so Sidebar/guards work
      const mem = membershipByBusinessId.get(b.parentId);

      return {
        id: b.id,
        parentId: b.parentId,
        commercialName: b.commercialName,
        category: b.category ?? parent?.category ?? null, // inherit
        isActive: b.isActive,
        phone: b.phone ?? null,
        address: b.address ?? null,
        departamento: b.departamento ?? null,
        provincia: b.provincia ?? null,
        distrito: b.distrito ?? null,
        ubigeoId: b.ubigeoId ?? null,

        membershipRole: mem?.role ?? null,
        membershipBranchId: mem?.branchId ?? null,

        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      };
    }),
  ];

  return items;
}

/**
 * Create branch under principal business.
 * - Only OWNER (or SUPERADMIN)
 * - Requires planKey === "pro" on the principal (SUPERADMIN bypasses)
 */
async function createBranch(principalBusinessId, payload, user) {
  const Business = sequelize.models.Business;

  const principal = await Business.findByPk(principalBusinessId);
  if (!principal)
    throw new HttpError(404, "Business not found.", "BIZ_NOT_FOUND");
  if (principal.parentId) {
    throw new HttpError(
      400,
      "Branches must be created under a principal business.",
      "BIZ_NOT_PRINCIPAL",
    );
  }

  const planKey = String(principal.planKey || "").toLowerCase();
  if (!isSuperAdmin(user) && planKey !== "pro") {
    throw new HttpError(
      403,
      "This action requires Plan Pro.",
      "BIZ_PLAN_PRO_REQUIRED",
    );
  }

  const branch = await Business.create({
    parentId: principal.id,
    commercialName: payload.commercialName.trim(),
    address: payload.address?.trim() || null,
    phone: payload.phone?.trim() || null,
    isActive: typeof payload.isActive === "boolean" ? payload.isActive : true,
    departamento: payload.departamento?.trim() || null,
    provincia: payload.provincia?.trim() || null,
    distrito: payload.distrito?.trim() || null,
    ubigeoId: payload.ubigeoId?.trim() || null,

    // Keep these null on branches
    legalName: null,
    ruc: null,
    businessUrl: null,
    email: null,
    category: null,
    // Optionally keep same planKey (not used for branch checks anyway)
    planKey: principal.planKey,
  });

  return branch;
}

/**
 * Update business (principal or branch).
 * OWNER (or SUPERADMIN) only.
 */
async function updateBusiness(businessId, patch, user) {
  const Business = sequelize.models.Business;

  const business = await Business.findByPk(businessId);
  if (!business)
    throw new HttpError(404, "Business not found.", "BIZ_NOT_FOUND");

  const isPrincipal = !business.parentId;

  const has = (k) => Object.prototype.hasOwnProperty.call(patch, k);

  // Always allowed for both
  if (has("commercialName")) business.commercialName = patch.commercialName;
  if (has("address")) business.address = patch.address;
  if (has("phone")) business.phone = patch.phone;
  if (has("departamento")) business.departamento = patch.departamento;
  if (has("provincia")) business.provincia = patch.provincia;
  if (has("distrito")) business.distrito = patch.distrito;
  if (has("ubigeoId")) business.ubigeoId = patch.ubigeoId;
  if (has("isActive")) business.isActive = patch.isActive;

  if (isPrincipal) {
    if (has("legalName")) business.legalName = patch.legalName;
    if (has("category")) business.category = patch.category;
    if (has("businessUrl")) business.businessUrl = patch.businessUrl;
    if (has("email")) business.email = patch.email;
    if (has("ruc")) business.ruc = patch.ruc;

    // planKey only SUPERADMIN (or billing flow later)
    if (has("planKey")) {
      if (!isSuperAdmin(user)) {
        throw new HttpError(
          403,
          "Only SUPERADMIN can change planKey.",
          "BIZ_PLAN_FORBIDDEN",
        );
      }
      business.planKey = String(patch.planKey).toLowerCase();
    }
  } else {
    // Branch: forbid principal-only fields
    const forbidden = [
      "legalName",
      "category",
      "businessUrl",
      "email",
      "ruc",
      "planKey",
    ];
    for (const f of forbidden) {
      if (has(f)) {
        throw new HttpError(
          400,
          `Field '${f}' cannot be updated on a branch.`,
          "BIZ_BRANCH_FIELD_FORBIDDEN",
        );
      }
    }
  }

  // Trim strings
  if (typeof business.commercialName === "string")
    business.commercialName = business.commercialName.trim();
  if (typeof business.legalName === "string")
    business.legalName = business.legalName.trim();
  if (typeof business.category === "string")
    business.category = business.category.trim();
  if (typeof business.address === "string")
    business.address = business.address.trim();
  if (typeof business.phone === "string")
    business.phone = business.phone.trim();
  if (typeof business.email === "string")
    business.email = business.email.trim();
  if (typeof business.businessUrl === "string")
    business.businessUrl = business.businessUrl.trim();
  if (typeof business.ruc === "string") business.ruc = business.ruc.trim();
  if (typeof business.departamento === "string")
    business.departamento = business.departamento.trim();
  if (typeof business.provincia === "string")
    business.provincia = business.provincia.trim();
  if (typeof business.distrito === "string")
    business.distrito = business.distrito.trim();
  if (typeof business.ubigeoId === "string")
    business.ubigeoId = business.ubigeoId.trim();

  await business.save();
  return business;
}

/**
 * MEMBERS: list users (OWNER only)
 */
async function listBusinessUsers(businessId, user) {
  const BusinessUser = sequelize.models.BusinessUser;
  const User = sequelize.models.User;

  const members = await BusinessUser.findAll({
    where: { businessId },
    include: [{ model: User, as: "user" }],
    order: [["createdAt", "ASC"]],
  });

  return members.map((m) => ({
    id: m.userId,
    name: m.user?.name,
    lastName: m.user?.lastName,
    email: m.user?.email,
    phone: m.user?.phone,
    role: m.role,
    status: m.status,
    createdAt: m.createdAt,
  }));
}

/**
 * MEMBERS: update (OWNER only). Protect last owner.
 */
async function updateMember(businessId, targetUserId, patch, user) {
  const BusinessUser = sequelize.models.BusinessUser;
  const Business = sequelize.models.Business; // <-- NEW (para validar branch)

  const membership = await BusinessUser.findOne({
    where: { businessId, userId: targetUserId },
  });
  if (!membership) {
    throw new HttpError(404, "Member not found.", "BIZ_MEMBER_NOT_FOUND");
  }

  // Protect last owner
  if (membership.role === BUSINESS_ROLES.OWNER) {
    const owners = await BusinessUser.count({
      where: {
        businessId,
        role: BUSINESS_ROLES.OWNER,
        status: MEMBERSHIP_STATUS.ACTIVE,
      },
    });

    const isDemotingOwner = patch.role && patch.role !== BUSINESS_ROLES.OWNER;
    const isSuspendingOwner =
      patch.status && patch.status !== MEMBERSHIP_STATUS.ACTIVE;

    if ((isDemotingOwner || isSuspendingOwner) && owners <= 1) {
      throw new HttpError(
        400,
        "Cannot change the last active owner.",
        "BIZ_LAST_OWNER",
      );
    }
  }

  // ---- NEW: branch assignment (optional) ----
  // Allow: patch.branchId = null (unassign) or UUID (assign)
  if (Object.prototype.hasOwnProperty.call(patch, "branchId")) {
    const nextBranchId = patch.branchId;

    if (nextBranchId === null || nextBranchId === "") {
      membership.branchId = null;
    } else {
      const branch = await Business.findByPk(nextBranchId);

      if (!branch) {
        throw new HttpError(404, "Branch not found.", "BRANCH_NOT_FOUND");
      }

      // Validate branch belongs to this business (branch.parentId = businessId)
      if (branch.parentId !== businessId) {
        throw new HttpError(
          400,
          "Branch does not belong to this business.",
          "BRANCH_NOT_IN_BUSINESS",
        );
      }

      membership.branchId = branch.id;
    }
  }

  // Existing updates
  if (patch.role) membership.role = patch.role;
  if (patch.status) membership.status = patch.status;

  await membership.save();
  return membership;
}

/**
 * MEMBERS: remove (OWNER only). Protect last owner.
 */
async function removeMember(businessId, targetUserId, user) {
  const BusinessUser = sequelize.models.BusinessUser;

  const membership = await BusinessUser.findOne({
    where: { businessId, userId: targetUserId },
  });
  if (!membership) {
    throw new HttpError(404, "Member not found.", "BIZ_MEMBER_NOT_FOUND");
  }

  // Protect last owner
  if (
    membership.role === BUSINESS_ROLES.OWNER &&
    membership.status === MEMBERSHIP_STATUS.ACTIVE
  ) {
    const owners = await BusinessUser.count({
      where: {
        businessId,
        role: BUSINESS_ROLES.OWNER,
        status: MEMBERSHIP_STATUS.ACTIVE,
      },
    });
    if (owners <= 1) {
      throw new HttpError(
        400,
        "Cannot remove the last active owner.",
        "BIZ_LAST_OWNER",
      );
    }
  }

  await membership.destroy();
  return { ok: true };
}

module.exports = {
  createBusiness,
  listBusinessesForUser,
  createBranch,
  updateBusiness,
  listBusinessUsers,
  updateMember,
  removeMember,
};
