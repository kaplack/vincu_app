// frontend/src/features/points/api/pointsApi.js
import apiClient from "@/services/apiClient";

/**
 * POST /api/points
 * Body esperado por backend:
 * - membershipId (UUID)
 * - type: "earn" | "adjust" | "redeem"
 * - points: int
 * - note?: string
 * - source?: "manual" | "qr" | "system"
 * - branchId?: UUID | null
 * - idempotencyKey?: string | null
 */
export async function createPointsTx(payload) {
  const { data } = await apiClient.post("/points", payload);
  return data; // { item, pointsBalance }
}

/**
 * GET /api/points?membershipId=...
 * (Opcional en tu vista; tú también tienes /customers/:id/transactions)
 */
export async function listPointsTx(params) {
  const { data } = await apiClient.get("/points", { params });
  return data; // { items }
}
