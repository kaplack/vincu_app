// src/features/settings/api/businessUsersApi.js
// Business Users (membership) API - roles per business
// Uses the shared apiClient (axios + auth interceptor)

import apiClient from "@/services/apiClient";

/**
 * Normalize role to UI-friendly label.
 * @param {string} role
 * @returns {"Owner"|"Manager"}
 */
export function normalizeRoleLabel(role) {
  const r = (role || "").toString().trim().toLowerCase();
  if (r === "owner") return "Owner";
  if (r === "manager") return "Manager";
  if (r === "operator") return "Operator";
  // default safe
  return "Manager";
}

/**
 * Normalize status to a stable lowercase enum for UI.
 * @param {string} status
 * @returns {"active"|"invited"|"suspended"}
 */
export function normalizeStatus(status) {
  const s = (status || "").toString().trim().toLowerCase();
  if (s === "active" || s === "invited" || s === "suspended") return s;
  return "active";
}

/**
 * Map backend payload into the shape your Usuarios.jsx expects.
 * IMPORTANT: This assumes the backend returns either:
 * - members[] with { id (userId) OR userId OR user: { id }, role, status, user/email/name }
 * - invitations[] with { id, email, role, createdAt }
 * If your backend uses different field names, adjust here (one place).
 *
 * @param {object} data
 * @returns {{ members: Array, invitations: Array, rows: Array }}
 */
export function mapBusinessUsersResponse(data) {
  const membersRaw = Array.isArray(data?.members) ? data.members : [];
  const invitesRaw = Array.isArray(data?.invitations) ? data.invitations : [];

  const members = membersRaw.map((m) => {
    const userId = m.userId ?? m.user?.id ?? m.id; // <- key alignment point
    const email = m.email ?? m.user?.email ?? "";
    const name = m.name ?? m.user?.name ?? "Usuario";

    return {
      id: userId,
      name,
      email,
      role: normalizeRoleLabel(m.role),
      status: normalizeStatus(m.status),
      createdAt: m.createdAt,
    };
  });

  const invitations = invitesRaw.map((inv) => ({
    id: inv.id ?? `inv_${inv.email}`,
    name: "Invitado Pendiente",
    email: (inv.email || "").toString(),
    role: normalizeRoleLabel(inv.role),
    status: "invited",
    createdAt: inv.createdAt,
  }));

  // Handy for your table: invitations first, then members
  const rows = [...invitations, ...members];

  return { members, invitations, rows };
}

/**
 * Get users/memberships for a business (Owner-only endpoint).
 * @param {string|number} businessId
 * @returns {Promise<{members:Array,invitations:Array,rows:Array}>}
 */
export async function listBusinessUsers(businessId) {
  if (!businessId) throw new Error("businessId is required");
  const { data } = await apiClient.get(`/businesses/${businessId}/users`);
  return mapBusinessUsersResponse(data);
}

/**
 * Invite a user by email to a business.
 * @param {string|number} businessId
 * @param {{email:string, role:"owner"|"manager"}} payload
 * @returns {Promise<any>}
 */
export async function inviteBusinessUser(businessId, payload) {
  console.log("inviteBusinessUser called with:", businessId, payload);
  if (!businessId) throw new Error("businessId is required");
  const email = (payload?.email || "").trim().toLowerCase();
  const role = (payload?.role || "manager").toString().trim().toLowerCase();

  if (!email) throw new Error("email is required");
  if (role !== "operator" && role !== "manager")
    throw new Error("invalid role");

  const { data } = await apiClient.post(
    `/businesses/${businessId}/invitations`,
    { email, role },
  );
  console.log("inviteBusinessUser response data:", data);
  return data;
}

/**
 * Update a business user membership (role/status).
 * NOTE: backend usually expects userId in the URL (not membershipId).
 * @param {string|number} businessId
 * @param {string|number} userId
 * @param {{role?: "owner"|"manager", status?: "active"|"suspended"}} payload
 * @returns {Promise<any>}
 */
export async function updateBusinessUser(businessId, userId, payload) {
  if (!businessId) throw new Error("businessId is required");
  if (!userId) throw new Error("userId is required");

  const body = {};
  if (payload?.role) body.role = payload.role.toString().trim().toLowerCase();
  if (payload?.status)
    body.status = payload.status.toString().trim().toLowerCase();

  const { data } = await apiClient.patch(
    `/businesses/${businessId}/users/${userId}`,
    body,
  );
  return data;
}

/**
 * Remove a user from a business.
 * @param {string|number} businessId
 * @param {string|number} userId
 * @returns {Promise<any>}
 */
export async function removeBusinessUser(businessId, userId) {
  if (!businessId) throw new Error("businessId is required");
  if (!userId) throw new Error("userId is required");

  const { data } = await apiClient.delete(
    `/businesses/${businessId}/users/${userId}`,
  );
  return data;
}
