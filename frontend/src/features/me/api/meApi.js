// src/features/me/api/meApi.js
import customerApiClient from "@/services/customerApiClient";

export async function getMyMemberships() {
  const { data } = await customerApiClient.get("/me/memberships");
  return data; // { memberships: [...] }
}

export async function getMembershipTransactions(membershipId) {
  const { data } = await customerApiClient.get(
    `/me/memberships/${membershipId}/transactions`,
  );
  return data; // { membershipId, transactions: [...] }
}

export async function getBusinessRewards(businessId) {
  const { data } = await customerApiClient.get(
    `/me/businesses/${businessId}/rewards`,
  );
  return data; // { businessId, pointsBalance, rewards: [...] }
}

export async function createRedemption(payload) {
  // payload: { membershipId, rewardId }
  const { data } = await customerApiClient.post("/me/redemptions", payload);
  return data; // { redemption, newBalance }
}

export async function getRedemptionById(redemptionId) {
  const { data } = await customerApiClient.get(
    `/me/redemptions/${redemptionId}`,
  );
  return data; // { redemption: {...} }
}
