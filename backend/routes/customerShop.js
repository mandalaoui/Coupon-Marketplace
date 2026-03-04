const { Router } = require("express");
const CustomerController = require("../controllers/CustomerController");

const router = Router();

// GET  /api/shop/products
router.get("/products", CustomerController.list);

// POST /api/shop/products/:productId/purchase
router.post("/products/:productId/purchase", CustomerController.purchase);

module.exports = router;
