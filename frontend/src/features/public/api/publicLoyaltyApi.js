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
 * POST /api/public/consulta/login
 * body: { phone, dni }
 */
export async function consultaLogin(payload) {
  const { data } = await publicApiClient.post(
    `/public/consulta/login`,
    payload,
  );
  return data; // { customerToken }
}

/**
 * GET /api/public/consulta/cards (requireCustomer)
 * OJO: acá NO sirve el interceptor del publicApiClient (usa vincu_token del app),
 * por eso mandamos el Authorization manual con customerToken.
 */
export async function consultaCards() {
  const customerToken = getCustomerToken();
  const { data } = await publicApiClient.get("/public/consulta/cards", {
    headers: {
      Authorization: customerToken ? `Bearer ${customerToken}` : undefined,
    },
  });
  return data;
}

/**
 * GET /api/public/c/:token
 */
export async function getByPublicToken(token) {
  const { data } = await publicApiClient.get(`/public/c/${token}`);
  return data;
}
