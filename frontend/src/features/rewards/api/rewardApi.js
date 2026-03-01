import apiClient from "@/services/apiClient";

const BASE = "/rewards";

/* ===============================
   CRUD
=================================*/

export async function listRewards(params = {}) {
  const { data } = await apiClient.get(BASE, { params });
  return data; // { items: [...] }
}

export async function createReward(payload) {
  const { data } = await apiClient.post(BASE, payload);
  return data; // { item }
}

export async function updateReward(rewardId, payload) {
  const { data } = await apiClient.patch(`${BASE}/${rewardId}`, payload);
  return data; // { item }
}

export async function archiveReward(rewardId) {
  const { data } = await apiClient.post(`${BASE}/${rewardId}/archive`);
  return data; // { item }
}

export async function deleteReward(rewardId) {
  await apiClient.delete(`${BASE}/${rewardId}`);
  return true;
}

/* ===============================
   IMAGES (S3 Presigned)
=================================*/

// 1) Pedir URL firmada (backend)
export async function presignRewardImage(rewardId, { mimeType, fileSize }) {
  const { data } = await apiClient.post(`/upload/rewards/${rewardId}/presign`, {
    mimeType,
    fileSize,
  });
  return data; // { uploadUrl, publicUrl, key }
}

// 2) Guardar URL en reward (backend)
export async function addRewardImage(rewardId, { imageUrl, setAsThumbnail }) {
  const { data } = await apiClient.post(`${BASE}/${rewardId}/images`, {
    imageUrl,
    setAsThumbnail,
  });
  return data; // { item: { id, images, thumbnailUrl } } (según tu backend)
}

// 3) Eliminar imagen (backend)
export async function removeRewardImage(rewardId, { imageUrl }) {
  const { data } = await apiClient.delete(`${BASE}/${rewardId}/images`, {
    data: { imageUrl },
  });
  return data;
}

// 4) Cambiar thumbnail (backend)
export async function setRewardThumbnail(rewardId, { thumbnailUrl }) {
  const { data } = await apiClient.post(`${BASE}/${rewardId}/thumbnail`, {
    thumbnailUrl,
  });
  return data;
}

/**
 * Subida completa:
 * - Presign en backend
 * - PUT directo a S3
 * - Guardar publicUrl en Reward
 *
 * @param {string} rewardId
 * @param {File} file
 * @param {{ setAsThumbnail?: boolean }} options
 */
export async function uploadRewardImage(rewardId, file, options = {}) {
  if (!rewardId) throw new Error("rewardId is required");
  if (!file) throw new Error("file is required");

  const allowed = ["image/jpeg", "image/png"];
  if (!allowed.includes(file.type)) {
    throw new Error("Only JPG/PNG allowed");
  }

  // 1) presign
  const { uploadUrl, publicUrl } = await presignRewardImage(rewardId, {
    mimeType: file.type,
    fileSize: file.size,
  });

  // 2) upload to S3
  const s3Res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!s3Res.ok) {
    // S3 a veces no devuelve JSON, así que mejor un error genérico
    throw new Error("S3 upload failed");
  }

  // 3) save in backend
  const data = await addRewardImage(rewardId, {
    imageUrl: publicUrl,
    setAsThumbnail: options.setAsThumbnail,
  });

  return data;
}
