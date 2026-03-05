const Joi = require("joi");

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const createCouponSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  description: Joi.string().trim().allow("").default(""),
  image_url: Joi.string().uri().required(),
  cost_price: Joi.number().min(0).precision(2).required(),
  margin_percentage: Joi.number().min(0).precision(2).required(),
  value_type: Joi.string().valid("STRING", "IMAGE").required(),
  value: Joi.string().required(),
});

const updateCouponSchema = Joi.object({
  name: Joi.string().trim().min(1),
  description: Joi.string().trim().allow(""),
  image_url: Joi.string().uri(),
  cost_price: Joi.number().min(0).precision(2),
  margin_percentage: Joi.number().min(0).precision(2),
  value_type: Joi.string().valid("STRING", "IMAGE"),
  value: Joi.string(),
}).min(1);

const resellerPurchaseSchema = Joi.object({
  reseller_price: Joi.number().min(0).required(),
});

module.exports = {
  loginSchema,
  createCouponSchema,
  updateCouponSchema,
  resellerPurchaseSchema,
};
