// src/controllers/reward.controller.js
const rewardService = require("../services/reward.service");

async function listRewards(req, res, next) {
  try {
    const businessId = req.principalBusinessId;

    const includeInactive = req.query?.includeInactive ?? false;
    const includeArchived = req.query?.includeArchived ?? false;
    const q = req.query?.q ?? "";

    const items = await rewardService.listRewards({
      businessId,
      includeInactive,
      includeArchived,
      q,
    });

    res.json({ items });
  } catch (err) {
    next(err);
  }
}

async function createReward(req, res, next) {
  try {
    const businessId = req.principalBusinessId;
    const createdByUserId = req.user?.id;

    const created = await rewardService.createReward({
      businessId,
      createdByUserId,
      payload: req.body,
    });

    res.status(201).json({ item: created });
  } catch (err) {
    next(err);
  }
}

async function updateReward(req, res, next) {
  try {
    const businessId = req.principalBusinessId;
    const rewardId = req.params.rewardId;
    const updatedByUserId = req.user?.id;

    const updated = await rewardService.updateReward({
      businessId,
      rewardId,
      updatedByUserId,
      payload: req.body,
    });

    res.json({ item: updated });
  } catch (err) {
    next(err);
  }
}

async function archiveReward(req, res, next) {
  try {
    const businessId = req.principalBusinessId;
    const rewardId = req.params.rewardId;
    const archivedByUserId = req.user?.id;

    const updated = await rewardService.archiveReward({
      businessId,
      rewardId,
      archivedByUserId,
    });

    res.json({ item: updated });
  } catch (err) {
    next(err);
  }
}

async function deleteReward(req, res, next) {
  try {
    const businessId = req.principalBusinessId;
    const rewardId = req.params.rewardId;

    await rewardService.deleteReward({
      businessId,
      rewardId,
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listRewards,
  createReward,
  updateReward,
  archiveReward,
  deleteReward,
};
