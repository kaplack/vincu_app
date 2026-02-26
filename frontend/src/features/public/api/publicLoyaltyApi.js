// frontend/src/features/public/api/publicLoyaltyApi.js
import publicApiClient from "@/services/publicApiClient";

const CUSTOMER_TOKEN_KEY = "vincu_customer_token";

export function setCustomerToken(token) {
  if (!token) return localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
}

export function getCustomerToken() {
  return localStorage.getItem(CUSTOMER_TOKEN_KEY);
}

export function clearCustomerToken() {
  localStorage.removeItem(CUSTOMER_TOKEN_KEY);
}

/**
 * POST /api/public/join/:slug
 * body: { firstName, lastName, dni, phone }
 */
export async function joinBySlug(slug, payload) {
  const { data } = await publicApiClient.post(`/public/join/${slug}`, payload);
  return data;
}

/**
 * GET /api/public/c/:token
 */
export async function getByPublicToken(token) {
  const { data } = await publicApiClient.get(`/public/c/${token}`);
  return data;
}

/**
 * GET /api/wallet-card/c/:token/save
 * Public: returns { saveUrl }
 */
export async function getWalletSaveUrlByPublicToken(token) {
  const { data } = await publicApiClient.get(`/wallet-card/c/${token}/save`);
  return data; // { saveUrl }
}
