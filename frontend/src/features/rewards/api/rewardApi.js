import apiClient from "@/services/apiClient";

const BASE = "/rewards";

export async function listRewards(params = {}) {
  // Tip: para mostrar activas + inactivas (pero no archivadas)
  // el backend soporta includeInactive/includeArchived como "true"/"false"
  const { data } = await apiClient.get(BASE, { params });
  return data; // { items: [...] }
}

export async function createReward(payload) {
  const { data } = await apiClient.post(BASE, payload);
  return data; // { item }
}

export async function updateReward(rewardId, payload) {
  const { data } = await apiClient.patch(`${BASE}/${rewardId}`, payload);
  return data; // { item }
}

export async function archiveReward(rewardId) {
  const { data } = await apiClient.post(`${BASE}/${rewardId}/archive`);
  return data; // { item }
}

export async function deleteReward(rewardId) {
  await apiClient.delete(`${BASE}/${rewardId}`);
  return true;
}
