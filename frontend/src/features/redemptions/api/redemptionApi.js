import apiClient from "@/services/apiClient";

const BASE = "/redemptions";

export async function listRedemptions(params = {}) {
  const { data } = await apiClient.get(BASE, { params });
  return data; // { items: [...] }
}

export async function consumeRedemption(payload) {
  const { data } = await apiClient.post(`${BASE}/consume`, payload);
  return data; // { ok, message, item }
}

export async function cancelRedemption(payload) {
  const { data } = await apiClient.post(`${BASE}/cancel`, payload);
  return data; // { ok, message, item }
}
