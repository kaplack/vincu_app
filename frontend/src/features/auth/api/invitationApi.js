import apiClient from "../../../services/apiClient";

export async function getInvitationByToken(token) {
  const { data } = await apiClient.get(`/invitations/${token}`);
  return data;
}

export async function acceptInvitation(token) {
  const { data } = await apiClient.post(`/invitations/${token}/accept`);
  return data;
}
