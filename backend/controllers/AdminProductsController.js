const ProductService = require("../services/ProductService");

class AdminProductsController {
  static async list(req, res, next) {
    try {
      const products = await ProductService.adminListAll();
      res.json({ products });
    } catch (err) {
      next(err);
    }
  }

  static async get(req, res, next) {
    try {
      const product = await ProductService.adminGetById(req.params.productId);
      res.json({ product });
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const product = await ProductService.adminCreateCoupon(req.body);
      res.status(201).json({ product });
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const product = await ProductService.adminUpdateCoupon(req.params.productId, req.body);
      res.json({ product });
    } catch (err) {
      next(err);
    }
  }

  static async remove(req, res, next) {
    try {
      const result = await ProductService.adminDeleteProduct(req.params.productId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AdminProductsController;
