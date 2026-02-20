// backend/src/controllers/points.controller.js
const pointsService = require("../services/points.service");

async function create(req, res, next) {
  try {
    const businessId = req.user?.currentBusinessId;
    const operatorUserId = req.user?.id;

    const result = await pointsService.createTransaction(
      businessId,
      operatorUserId,
      req.body,
    );

    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    // Si aún no implementaste GET /api/points, puedes dejarlo luego.
    return res.status(200).json({ items: [] });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list };
