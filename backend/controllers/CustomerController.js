const ProductService = require("../services/ProductService");

class CustomerController {
  static async list(req, res, next) {
    try {
      const products = await ProductService.listUnsold();
      res.json({ products });
    } catch (err) {
      next(err);
    }
  }

  static async purchase(req, res, next) {
    try {
      const result = await ProductService.customerPurchase(req.params.productId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = CustomerController;
