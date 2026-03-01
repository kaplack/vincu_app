// src/services/reward.service.js
const { Op } = require("sequelize");
const { HttpError } = require("../utils/httpError");
const models = require("../models");

function toBool(v, defaultValue = false) {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v === "true";
  return defaultValue;
}

async function listRewards({
  businessId,
  includeInactive,
  includeArchived,
  q,
}) {
  const where = { businessId };

  const _includeInactive = toBool(includeInactive, false);
  const _includeArchived = toBool(includeArchived, false);

  if (!_includeInactive) where.isActive = true;
  if (!_includeArchived) where.isArchived = false;

  if (q && q.trim()) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${q.trim()}%` } },
      { description: { [Op.iLike]: `%${q.trim()}%` } },
    ];
  }

  const items = await models.Reward.findAll({
    where,
    order: [["createdAt", "DESC"]],
  });

  return items;
}

async function createReward({ businessId, createdByUserId, payload }) {
  if (!payload?.name) {
    throw new HttpError(400, "Name is required.", "REWARD_NAME_REQUIRED");
  }

  if (
    !Number.isInteger(payload.pointsRequired) ||
    payload.pointsRequired <= 0
  ) {
    throw new HttpError(400, "Invalid pointsRequired.", "VALIDATION_ERROR");
  }

  const created = await models.Reward.create({
    businessId,
    name: payload.name,
    description: payload.description ?? null,
    pointsRequired: payload.pointsRequired,
    isActive: payload.isActive ?? true,
    isArchived: payload.isArchived ?? false,
    createdByUserId: createdByUserId ?? null,
  });

  return created;
}

async function updateReward({
  businessId,
  rewardId,
  updatedByUserId,
  payload,
}) {
  const reward = await models.Reward.findOne({
    where: { id: rewardId, businessId },
  });
  if (!reward) {
    throw new HttpError(404, "Reward not found.", "REWARD_NOT_FOUND");
  }

  // Prevent updating archived rewards unless explicitly unarchiving
  if (reward.isArchived && payload.isArchived !== false) {
    throw new HttpError(
      409,
      "Archived reward cannot be modified.",
      "REWARD_ARCHIVED",
    );
  }

  if ("pointsRequired" in payload) {
    if (
      !Number.isInteger(payload.pointsRequired) ||
      payload.pointsRequired <= 0
    ) {
      throw new HttpError(400, "Invalid pointsRequired.", "VALIDATION_ERROR");
    }
  }

  await reward.update({
    ...("name" in payload ? { name: payload.name } : {}),
    ...("description" in payload
      ? { description: payload.description ?? null }
      : {}),
    ...("pointsRequired" in payload
      ? { pointsRequired: payload.pointsRequired }
      : {}),
    ...("isActive" in payload ? { isActive: payload.isActive } : {}),
    ...("isArchived" in payload ? { isArchived: payload.isArchived } : {}),
    updatedByUserId: updatedByUserId ?? reward.updatedByUserId ?? null,
  });

  return reward;
}

async function archiveReward({ businessId, rewardId, archivedByUserId }) {
  const reward = await models.Reward.findOne({
    where: { id: rewardId, businessId },
  });
  if (!reward) {
    throw new HttpError(404, "Reward not found.", "REWARD_NOT_FOUND");
  }

  await reward.update({
    isArchived: true,
    isActive: false,
    updatedByUserId: archivedByUserId ?? reward.updatedByUserId ?? null,
  });

  return reward;
}

/**
 * Hard delete (dangerous): only allow if no redemptions exist
 */
async function deleteReward({ businessId, rewardId }) {
  const reward = await models.Reward.findOne({
    where: { id: rewardId, businessId },
  });
  if (!reward) {
    throw new HttpError(404, "Reward not found.", "REWARD_NOT_FOUND");
  }

  const redemptionCount = await models.RewardRedemption.count({
    where: { businessId, rewardId },
  });

  if (redemptionCount > 0) {
    throw new HttpError(
      409,
      "Cannot delete reward with redemption history. Archive instead.",
      "REWARD_HAS_HISTORY",
    );
  }

  await reward.destroy();
}

async function addRewardImage({
  businessId,
  rewardId,
  imageUrl,
  setAsThumbnail,
}) {
  const reward = await models.Reward.findOne({
    where: { id: rewardId, businessId },
  });
  if (!reward) {
    throw new HttpError(404, "Reward not found.", "REWARD_NOT_FOUND");
  }

  const images = Array.isArray(reward.images) ? reward.images : [];

  // idempotente: si ya existe, solo setea thumbnail si lo piden
  if (images.includes(imageUrl)) {
    if (setAsThumbnail) {
      await reward.update({ thumbnailUrl: imageUrl });
    }
    return reward;
  }

  if (images.length >= 3) {
    throw new HttpError(400, "Max 3 images per reward.", "MAX_IMAGES");
  }

  const updatedImages = [...images, imageUrl];

  let thumbnailUrl = reward.thumbnailUrl;

  // si no hay thumbnail, la primera imagen se vuelve thumbnail
  if (!thumbnailUrl) thumbnailUrl = imageUrl;

  // si el request dice que sea thumbnail, lo forzamos
  if (setAsThumbnail) thumbnailUrl = imageUrl;

  await reward.update({
    images: updatedImages,
    thumbnailUrl,
  });

  return reward;
}

async function removeRewardImage({ businessId, rewardId, imageUrl }) {
  const reward = await models.Reward.findOne({
    where: { id: rewardId, businessId },
  });
  if (!reward) {
    throw new HttpError(404, "Reward not found.", "REWARD_NOT_FOUND");
  }

  const images = Array.isArray(reward.images) ? reward.images : [];
  const updatedImages = images.filter((img) => img !== imageUrl);

  let thumbnailUrl = reward.thumbnailUrl;

  // si borran el thumbnail, reasignar al primero o null
  if (thumbnailUrl === imageUrl) {
    thumbnailUrl = updatedImages[0] ?? null;
  }

  // si ya no quedan imágenes, thumbnail null
  if (updatedImages.length === 0) thumbnailUrl = null;

  await reward.update({
    images: updatedImages,
    thumbnailUrl,
  });

  return reward;
}

async function setRewardThumbnail({ businessId, rewardId, thumbnailUrl }) {
  const reward = await models.Reward.findOne({
    where: { id: rewardId, businessId },
  });
  if (!reward) {
    throw new HttpError(404, "Reward not found.", "REWARD_NOT_FOUND");
  }

  const images = Array.isArray(reward.images) ? reward.images : [];

  if (!images.includes(thumbnailUrl)) {
    throw new HttpError(
      400,
      "Thumbnail must be one of reward images.",
      "THUMBNAIL_INVALID",
    );
  }

  await reward.update({ thumbnailUrl });

  return reward;
}

module.exports = {
  listRewards,
  createReward,
  updateReward,
  archiveReward,
  deleteReward,
  addRewardImage,
  removeRewardImage,
  setRewardThumbnail,
};
