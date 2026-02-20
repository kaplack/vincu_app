// src/services/customerApiClient.js
import axios from "axios";
import {
  getCustomerToken,
  clearCustomerToken,
} from "@/features/public/api/publicLoyaltyApi";

const customerApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Request: agrega token customer
customerApiClient.interceptors.request.use(
  (config) => {
    const token = getCustomerToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// Response: si 401, limpia token customer (NO toca vincu_token)
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
