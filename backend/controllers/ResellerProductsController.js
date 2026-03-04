const ProductService = require("../services/ProductService");

class ResellerProductsController {
  static async list(req, res, next) {
    try {
      const products = await ProductService.listUnsold();
      res.json( products );
    } catch (err) {
      next(err);
    }
  }

  static async get(req, res, next) {
    try {
      const product = await ProductService.getPublicById(req.params.productId);
      res.json( product );
    } catch (err) {
      next(err);
    }
  }

  static async purchase(req, res, next) {
    try {
      const { reseller_price } = req.body;
      const result = await ProductService.resellerPurchase(
        req.params.productId,
        reseller_price
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ResellerProductsController;
