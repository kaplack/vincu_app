// src/controllers/catalog.controller.js
const catalogService = require("../services/catalog.service");

async function listActiveRewards(req, res, next) {
  try {
    const businessSlug = req.params.businessSlug;
    const q = req.query?.q ?? "";

    const items = await catalogService.listActiveRewards({
      businessSlug,
      q,
    });

    res.json({ items });
  } catch (err) {
    next(err);
  }
}

async function createRedemption(req, res, next) {
  try {
    const customerId = req.customerId; // set by requireCustomer
    const businessSlug = req.params.businessSlug;

    const { rewardId, idempotencyKey } = req.body;

    const result = await catalogService.createRedemption({
      customerId,
      businessSlug,
      rewardId,
      idempotencyKey,
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listActiveRewards,
  createRedemption,
};
