const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const productSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    type: { type: String, required: true, enum: ["COUPON"] },
    image_url: { type: String, required: true, trim: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    discriminatorKey: "type",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual("id").get(function () {
  return this._id;
});

productSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Product = mongoose.model("Product", productSchema);

// Coupon discriminator
const couponSchema = new mongoose.Schema(
  {
    cost_price: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      get: (v) => (v == null ? undefined : parseFloat(v.toString())),
    },
    margin_percentage: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      get: (v) => (v == null ? undefined : parseFloat(v.toString())),
    },
    is_sold: { type: Boolean, default: false },
    value_type: { type: String, enum: ["STRING", "IMAGE"], required: true },
    value: { type: String, required: true, select: false },
  },
  { toJSON: { getters: true, virtuals: true }, toObject: { getters: true, virtuals: true } }
);

couponSchema.virtual("minimum_sell_price").get(function () {
  const cp = parseFloat(this.cost_price?.toString() ?? "0");
  const mp = parseFloat(this.margin_percentage?.toString() ?? "0");
  return parseFloat((cp * (1 + mp / 100)).toFixed(2));
});

const Coupon = Product.discriminator("COUPON", couponSchema);

module.exports = { Product, Coupon };