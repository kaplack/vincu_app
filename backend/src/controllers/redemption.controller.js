// src/controllers/redemption.controller.js
const redemptionService = require("../services/redemption.service");

async function listRedemptions(req, res, next) {
  try {
    const businessId = req.principalBusinessId;

    const status = req.query?.status;
    const q = req.query?.q ?? "";
    const includeCancelled = req.query?.includeCancelled ?? false;

    const items = await redemptionService.listRedemptions({
      businessId,
      status,
      q,
      includeCancelled,
    });

    res.json({ items });
  } catch (err) {
    next(err);
  }
}

async function consumeRedemption(req, res, next) {
  try {
    const businessId = req.principalBusinessId;
    const operatorUserId = req.user?.id;
    const branchId = req.selectedBranchId || null; // ajustamos en service si quieres

    const { redeemCode } = req.body;

    const result = await redemptionService.consumeRedemption({
      businessId,
      redeemCode,
      operatorUserId,
      branchId,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function cancelRedemption(req, res, next) {
  try {
    const businessId = req.principalBusinessId;
    const operatorUserId = req.user?.id;
    const branchId = req.selectedBranchId;

    const { redeemCode, reasonCode, reasonText } = req.body;

    const result = await redemptionService.cancelRedemption({
      businessId,
      redeemCode,
      operatorUserId,
      branchId,
      reasonCode,
      reasonText,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listRedemptions,
  consumeRedemption,
  cancelRedemption,
};
