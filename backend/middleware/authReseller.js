const { RESELLER_TOKENS } = require("../config/env");
const AppError = require("../utils/AppError");

const authReseller = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(AppError.unauthorized("Reseller Bearer token required"));
  }

  const token = authHeader.slice(7);
  if (!RESELLER_TOKENS.includes(token)) {
    return next(AppError.unauthorized("Invalid reseller token"));
  }

  req.reseller = { token };
  next();
};

module.exports = authReseller;
