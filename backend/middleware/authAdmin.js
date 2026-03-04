const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env");
const AppError = require("../utils/AppError");
const UserRepository = require("../repositories/UserRepository");

const authAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw AppError.unauthorized("Admin Bearer token required");
    }

    const token = authHeader.slice(7);
    const payload = jwt.verify(token, JWT_SECRET);

    const user = await UserRepository.findById(payload.id);
    if (!user || user.role !== "admin") {
      throw AppError.unauthorized("Not an admin account");
    }

    req.admin = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authAdmin;
