const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/env");
const UserRepository = require("../repositories/UserRepository");
const AppError = require("../utils/AppError");

class AuthService {
  static async login(email, password) {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw AppError.unauthorized("Invalid credentials");

    const valid = await user.comparePassword(password);
    if (!valid) throw AppError.unauthorized("Invalid credentials");

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return { token, user };
  }
}

module.exports = AuthService;
