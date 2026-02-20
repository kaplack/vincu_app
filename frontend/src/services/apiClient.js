// src/services/apiClient.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: agrega JWT
apiClient.interceptors.request.use(
  (config) => {
    console.log("Request made with config:", config);
    const token = localStorage.getItem("vincu_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: manejo global de errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el token expiró o es inválido
    if (error.response?.status === 401) {
      localStorage.removeItem("vincu_token");
      // más adelante aquí puedes despachar logout()
    }
    return Promise.reject(error);
  },
);

export default apiClient;
