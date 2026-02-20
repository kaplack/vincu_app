// src/features/auth/api/authApi.js
import apiClient from "../../../services/apiClient";

/**
 * Auth API
 * All calls return the backend payload:
 * { token, user, needsBusinessSetup } (for login/register)
 * { user, needsBusinessSetup } (for me)
 */

export async function login({ identifier, password }) {
  const { data } = await apiClient.post("/auth/login", {
    identifier,
    password,
  });
  return data;
}

export async function register({ name, lastName, email, phone, password }) {
  const payload = {
    name,
    lastName,
    // Send only if provided (avoid empty strings)
    ...(email ? { email } : {}),
    ...(phone ? { phone } : {}),
    password,
  };

  const { data } = await apiClient.post("/auth/register", payload);
  return data;
}

export async function me() {
  const { data } = await apiClient.get("/auth/me");
  return data;
}
