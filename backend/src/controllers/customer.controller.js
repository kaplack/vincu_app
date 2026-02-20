// backend/src/controllers/customer.controller.js
const customerService = require("../services/customer.service");

async function list(req, res, next) {
  try {
    console.log("Customer Controller - List called", req.user);
    const businessId = req.user?.currentBusinessId;
    const result = await customerService.listForBusiness(businessId);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getByMembershipId(req, res, next) {
  try {
    const businessId = req.user?.currentBusinessId;
    const { membershipId } = req.params;

    const result = await customerService.getMembershipDetail(
      businessId,
      membershipId,
    );
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getByQrToken(req, res, next) {
  try {
    const businessId = req.user?.currentBusinessId;
    const { qrToken } = req.params;

    const result = await customerService.getMembershipByQrToken(
      businessId,
      qrToken,
    );
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function listTransactions(req, res, next) {
  try {
    const businessId = req.user?.currentBusinessId;
    const { membershipId } = req.params;

    const result = await customerService.listTransactions(
      businessId,
      membershipId,
    );
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  getByMembershipId,
  getByQrToken,
  listTransactions,
};
