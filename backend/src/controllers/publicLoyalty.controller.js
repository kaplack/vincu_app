// backend/src/controllers/publicLoyalty.controller.js
const publicLoyaltyService = require("../services/publicLoyalty.service");

async function joinBySlug(req, res, next) {
  try {
    const result = await publicLoyaltyService.joinBySlug(
      req.params.slug,
      req.body,
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function consultaLogin(req, res, next) {
  try {
    const result = await publicLoyaltyService.consultaLogin(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function consultaCards(req, res, next) {
  try {
    const result = await publicLoyaltyService.consultaCards(req.customerId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getByPublicToken(req, res, next) {
  try {
    const result = await publicLoyaltyService.getByPublicToken(
      req.params.token,
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  joinBySlug,
  consultaLogin,
  consultaCards,
  getByPublicToken,
};
