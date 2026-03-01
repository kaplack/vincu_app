// src/controllers/upload.controller.js
const { presignRewardImageUpload } = require("../services/upload.service");

async function presignRewardImage(req, res, next) {
  try {
    const businessId = req.principalBusinessId; // lo setea requireBusinessMember
    const { rewardId } = req.params;
    const { mimeType, fileSize } = req.body;

    const data = await presignRewardImageUpload({
      businessId,
      rewardId,
      mimeType,
      fileSize,
    });

    return res.json(data);
  } catch (err) {
    return next(err);
  }
}

module.exports = { presignRewardImage };
