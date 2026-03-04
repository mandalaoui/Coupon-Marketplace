const { Router } = require("express");
const AdminProductsController = require("../controllers/AdminProductsController");
const authAdmin = require("../middleware/authAdmin");
const validate = require("../middleware/validate");
const { createCouponSchema, updateCouponSchema } = require("../utils/schemas");

const router = Router();

// All admin product routes require admin auth
router.use(authAdmin);

// GET  /api/admin/products
router.get("/", AdminProductsController.list);

// GET  /api/admin/products/:productId
router.get("/:productId", AdminProductsController.get);

// POST /api/admin/products  (create coupon)
router.post("/", validate(createCouponSchema), AdminProductsController.create);

// PATCH /api/admin/products/:productId
router.patch("/:productId", validate(updateCouponSchema), AdminProductsController.update);

// DELETE /api/admin/products/:productId
router.delete("/:productId", AdminProductsController.remove);

module.exports = router;
