const { Router } = require("express");
const AdminAuthController = require("../controllers/AdminAuthController");
const authAdmin = require("../middleware/authAdmin");
const validate = require("../middleware/validate");
const { loginSchema } = require("../utils/schemas");

const router = Router();

// POST /api/admin/auth/login
router.post("/login", validate(loginSchema), AdminAuthController.login);

// GET  /api/admin/auth/me  (protected)
router.get("/me", authAdmin, AdminAuthController.me);

module.exports = router;
