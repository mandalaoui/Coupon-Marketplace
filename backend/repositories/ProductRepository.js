const mongoose = require("mongoose");
const { Product, Coupon } = require("../models/Product");

class ProductRepository {
  /** Return all unsold products (for reseller & customer listing) */
  static async findUnsold() {
    return Product.find({ is_sold: false });
  }

  /** Return all products regardless of sold status (admin view) */
  static async findAll() {
    return Product.find({});
  }

  static async findById(id) {
    return Product.findById(id);
  }

  static async createCoupon(data) {
    return Coupon.create(data);
  }

  static async updateCoupon(id, data) {
    return Coupon.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  static async deleteById(id) {
    return Product.findByIdAndDelete(id);
  }

  static async findCouponWithValueById(id) {
    return Coupon.findById(id).select("+value");
  }

  static async atomicMarkSoldWithValue(id, session = null) {
    const opts = { new: true };
    if (session) opts.session = session;
  
    return Coupon.findOneAndUpdate(
      { _id: id, is_sold: false },
      { $set: { is_sold: true } },
      opts
    ).select("+value");
  }
}

module.exports = ProductRepository;
