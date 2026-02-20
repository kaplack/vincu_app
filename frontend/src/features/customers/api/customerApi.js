import apiClient from "@/services/apiClient";

const BASE = "/customers";

export async function listCustomers() {
  const { data } = await apiClient.get(BASE);
  return data; // { items: [...] }
}

export async function getMembershipDetail(membershipId) {
  const { data } = await apiClient.get(`${BASE}/${membershipId}`);
  return data; // { item: {...} }
}

export async function getByQrToken(qrToken) {
  const { data } = await apiClient.get(`${BASE}/qr/${qrToken}`);
  return data; // { item: {...} }
}

export async function listTransactions(membershipId) {
  const { data } = await apiClient.get(`${BASE}/${membershipId}/transactions`);
  return data; // { items: [...] }
}
