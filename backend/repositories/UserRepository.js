const User = require("../models/User");

class UserRepository {
  static async findByEmail(email) {
    return User.findOne({ email: email.toLowerCase() });
  }

  static async findById(id) {
    return User.findById(id);
  }

  static async create({ email, password }) {
    const password_hash = await User.hashPassword(password);
    return User.create({ email, password_hash });
  }

  static async exists(email) {
    return User.exists({ email: email.toLowerCase() });
  }
}

module.exports = UserRepository;
