// backend/src/controllers/walletCard.controller.js
const walletCardService = require("../services/walletCard.service");

module.exports = {
  async getMyWalletCard(req, res, next) {
    try {
      const businessId = req.user?.currentBusinessId;
      const config = await walletCardService.getOrCreateConfig(businessId);
      res.json(config);
    } catch (err) {
      next(err);
    }
  },

  async getAffiliation(req, res, next) {
    try {
      const businessId = req.user?.currentBusinessId;
      const joinUrl = walletCardService.buildJoinUrl(businessId);
      res.json({ joinUrl });
    } catch (err) {
      next(err);
    }
  },

  async updateBranding(req, res, next) {
    try {
      const businessId = req.user?.currentBusinessId;

      // payload esperado desde frontend:
      // { commercialName, primaryColor, secondaryColor, description }
      const updated = await walletCardService.updateBranding({
        businessId,
        payload: req.body,
      });

      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
};
