const AuthService = require("../services/AuthService");

class AdminAuthController {
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { token, user } = await AuthService.login(email, password);
      res.json({ token, user });
    } catch (err) {
      next(err);
    }
  }

  static async me(req, res) {
    res.json({ user: req.admin });
  }
}

module.exports = AdminAuthController;
