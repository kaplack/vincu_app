const { setCurrentBusiness } = require("../services/user.service");

async function setCurrentBusinessController(req, res, next) {
  try {
    const { currentBusinessId } = req.body;
    const user = await setCurrentBusiness(req.user, currentBusinessId);
    res.status(200).json({ user: { id: user.id, currentBusinessId: user.currentBusinessId } });
  } catch (err) {
    next(err);
  }
}

module.exports = { setCurrentBusinessController };
