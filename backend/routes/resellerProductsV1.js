const { Router } = require("express");
const ResellerProductsController = require("../controllers/ResellerProductsController");
const authReseller = require("../middleware/authReseller");
const validate = require("../middleware/validate");
const { resellerPurchaseSchema } = require("../utils/schemas");

const router = Router();

router.use(authReseller);

// GET  /api/v1/products
router.get("/", ResellerProductsController.list);

// GET  /api/v1/products/:productId
router.get("/:productId", ResellerProductsController.get);

// POST /api/v1/products/:productId/purchase
router.post(
  "/:productId/purchase",
  validate(resellerPurchaseSchema),
  ResellerProductsController.purchase
);

module.exports = router;
