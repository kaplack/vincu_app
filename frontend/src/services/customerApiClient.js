// src/services/customerApiClient.js
import axios from "axios";

const CUSTOMER_TOKEN_KEY = "vincu_customer_token";

export function getCustomerToken() {
  return localStorage.getItem(CUSTOMER_TOKEN_KEY);
}

export function setCustomerToken(token) {
  if (!token) return;
  localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
}

export function clearCustomerToken() {
  localStorage.removeItem(CUSTOMER_TOKEN_KEY);
}

const customerApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Request: agrega token customer (cuando exista /me auth)
customerApiClient.interceptors.request.use(
  (config) => {
    const token = getCustomerToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// Response: si 401, limpia token customer
customerApiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      clearCustomerToken();
    }
    return Promise.reject(error);
  },
);

export default customerApiClient;
