import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const publicApiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Interceptor de response
 * ⚠️ Importante:
 * - NO toca vincu_token
 * - NO hace logout
 * - Solo devuelve el error
 */
publicApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);

export default publicApiClient;
