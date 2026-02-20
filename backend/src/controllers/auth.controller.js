const authService = require("../services/auth.service");

async function register(req, res, next) {
  console.log("Register payload:", req.body);
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const result = await authService.me(req.user);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };
