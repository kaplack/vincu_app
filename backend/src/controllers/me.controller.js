const service = require("../services/me.service");

async function listMemberships(req, res, next) {
  try {
    const data = await service.listMemberships(req.customerId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function listMembershipTransactions(req, res, next) {
  try {
    const data = await service.listMembershipTransactions(
      req.customerId,
      req.params.membershipId,
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function listBusinessRewards(req, res, next) {
  try {
    const data = await service.listBusinessRewards(
      req.customerId,
      req.params.businessId,
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function createRedemption(req, res, next) {
  try {
    const data = await service.createRedemption(req.customerId, req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

async function getRedemptionById(req, res, next) {
  try {
    const data = await service.getRedemptionById(
      req.customerId,
      req.params.redemptionId,
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listMemberships,
  listMembershipTransactions,
  listBusinessRewards,
  createRedemption,
  getRedemptionById,
};
