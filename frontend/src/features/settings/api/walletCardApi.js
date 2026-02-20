// frontend/src/features/settings/api/walletCardApi.js
import apiClient from "@/services/apiClient";

export const walletCardService = {
  async getConfig() {
    const { data } = await apiClient.get("/wallet-card");
    return data;
  },

  async updateBranding(payload) {
    // payload: { primaryColor, secondaryColor, description }
    const { data } = await apiClient.put("/wallet-card/branding", payload);
    return data;
  },
};
