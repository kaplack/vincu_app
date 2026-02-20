// frontend/src/features/settings/api/businessApi.js
import apiClient from "@/services/apiClient";

/**
 * Map backend business item to UI-friendly shape.
 * We keep a legacy `name` field for compatibility with the current Negocio.jsx,
 * where the UI still references row.name in several places. :contentReference[oaicite:2]{index=2}
 */
function mapBusinessItem(b) {
  if (!b) return b;

  const commercialName = b.commercialName ?? b.name ?? "";
  const legalName = b.legalName ?? "";
  const category = b.category ?? "";

  return {
    ...b,
    commercialName,
    legalName,
    category,

    // Legacy compatibility (current UI uses row.name)
    name: commercialName,
  };
}

export async function listBusinesses() {
  const { data } = await apiClient.get("/businesses");
  const items = Array.isArray(data?.items) ? data.items : [];
  return items.map(mapBusinessItem);
}

export async function createBusiness(payload) {
  // payload: { commercialName, legalName, category }
  const { data } = await apiClient.post("/businesses", payload);
  return mapBusinessItem(data?.business);
}

export async function createBranch(businessId, payload) {
  // payload: { commercialName, address, phone?, isActive?, ubigeo? }
  const { data } = await apiClient.post(
    `/businesses/${businessId}/branches`,
    payload,
  );
  return mapBusinessItem(data?.branch);
}

export async function updateBusiness(businessId, patch) {
  const { data } = await apiClient.patch(`/businesses/${businessId}`, patch);
  return mapBusinessItem(data?.business);
}

export async function setCurrentBusiness(businessId) {
  const { data } = await apiClient.patch("/users/me/current-business", {
    currentBusinessId: businessId,
  });
  // Idealmente el backend devuelve { user } o algo. Si no, devolvemos businessId.
  return data?.user?.currentBusinessId || businessId;
}
