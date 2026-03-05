const ProductRepository = require("../repositories/ProductRepository");
const AppError = require("../utils/AppError");

/**
 * Formats a product for the reseller/customer API response.
 * Never exposes cost_price, margin_percentage, or coupon value.
 */
const toPublicDTO = (product) => {
  const obj = product.toObject({ getters: true, virtuals: true });
  return {
    id: obj._id,
    name: obj.name,
    description: obj.description,
    type: obj.type,
    image_url: obj.image_url,
    price: obj.minimum_sell_price,  // derived virtual
    created_at: obj.created_at,
    updated_at: obj.updated_at,
  };
};

/**
 * Formats a product for Admin API (includes cost_price, margin, sold status).
 * Still never includes coupon value in list responses.
 */
const toAdminDTO = (product) => {
  const obj = product.toObject({ getters: true, virtuals: true });
  return {
    id: obj._id,
    name: obj.name,
    description: obj.description,
    type: obj.type,
    image_url: obj.image_url,
    cost_price: obj.cost_price,
    margin_percentage: obj.margin_percentage,
    minimum_sell_price: obj.minimum_sell_price,
    value_type: obj.value_type,
    is_sold: obj.is_sold,
    created_at: obj.created_at,
    updated_at: obj.updated_at,
  };
};

class ProductService {
  // ── Public / Reseller ───────────────────────────────────────────────────────

  static async listUnsold() {
    const products = await ProductRepository.findUnsold();
    return products.map(toPublicDTO);
  }

  static async getPublicById(id) {
    const product = await ProductRepository.findById(id);
    if (!product) throw AppError.notFound("Product");
    return toPublicDTO(product);
  }

  /**
   * Reseller purchase:
   * 1. Validate product exists
   * 2. Validate not sold
   * 3. Validate reseller_price >= minimum_sell_price
   * 4. Atomic mark sold
   * 5. Return coupon value
   */
  static async resellerPurchase(productId, resellerPrice) {
    const product = await ProductRepository.findById(productId);
    if (!product) throw AppError.notFound("Product");

    const obj = product.toObject({ getters: true, virtuals: true });
    if (obj.is_sold) throw AppError.alreadySold();

    const minPrice = obj.minimum_sell_price;
    if (resellerPrice < minPrice) throw AppError.priceTooLow(minPrice);

    // Atomic update — if another request already sold it, returns null
    const sold = await ProductRepository.atomicMarkSoldWithValue(productId);
    if (!sold) throw AppError.alreadySold();

    return {
      product_id: sold._id,
      final_price: resellerPrice,
      value_type: sold.value_type,
      value: sold.value,  // reveal coupon value only here
    };
  }

  /**
   * Direct customer purchase (no price override — price = minimum_sell_price).
   */
  static async customerPurchase(productId) {
    const product = await ProductRepository.findById(productId);
    if (!product) throw AppError.notFound("Product");

    const obj = product.toObject({ getters: true, virtuals: true });
    if (obj.is_sold) throw AppError.alreadySold();

    const sold = await ProductRepository.atomicMarkSoldWithValue(productId);
    if (!sold) throw AppError.alreadySold();

    return {
      product_id: sold._id,
      final_price: obj.minimum_sell_price,
      value_type: sold.value_type,
      value: sold.value,
    };
  }

  // ── Admin ───────────────────────────────────────────────────────────────────

  static async adminListAll() {
    const products = await ProductRepository.findAll();
    return products.map(toAdminDTO);
  }

  static async adminGetById(id) {
    const product = await ProductRepository.findById(id);
    if (!product) throw AppError.notFound("Product");
    return toAdminDTO(product);
  }

  static async adminCreateCoupon(data) {
    // minimum_sell_price is derived — strip if sent
    const { cost_price, margin_percentage, name, description, image_url, value_type, value } = data;
    const created = await ProductRepository.createCoupon({
      name, description, image_url, cost_price, margin_percentage, value_type, value,
    });
    return toAdminDTO(created);
  }

  static async adminUpdateCoupon(id, data) {
    if (!data || typeof data !== "object") {
      throw AppError.validation("Body must be a JSON object");
    }
  
    delete data.minimum_sell_price;
    delete data.type;
  
    const updated = await ProductRepository.updateCoupon(id, data);
    if (!updated) throw AppError.notFound("Product");
    return toAdminDTO(updated);
  }

  static async adminDeleteProduct(id) {
    const deleted = await ProductRepository.deleteById(id);
    if (!deleted) throw AppError.notFound("Product");
    return { id };
  }
}

module.exports = ProductService;
