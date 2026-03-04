
/**
 * Coupon Validation Utilities
 *
 * - cost_price: must be decimal >= 0 (required, but never accepted from client)
 * - margin_percentage: must be decimal >= 0 (required, but never accepted from client)
 * - minimum_sell_price: always derived, never client-supplied
 * - is_sold: boolean (default: false)
 * - value_type: must be one of ["STRING", "IMAGE"]
 * - value: must exist if value_type is supplied
 *
 * Pricing fields must NOT be accepted from external client input; always enforced/assigned server-side.
 */

const VALID_VALUE_TYPES = ["STRING", "IMAGE"];

/**
 * Validates the client input for creating/updating a Coupon product.
 * Ensures pricing fields are NOT supplied and value_type/value is valid.
 * 
 * @param {object} data - the user input (parsed body)
 * @param {object} [opts] - Validation options
 * @returns {object} - { valid: Boolean, errors: string[] }
 */
function validateCouponInput(data, opts = {}) {
  const errors = [];

  // Do NOT accept pricing fields from clients
  if ('cost_price' in data) {
    errors.push("cost_price must not be supplied by external clients");
  }
  if ('margin_percentage' in data) {
    errors.push("margin_percentage must not be supplied by external clients");
  }
  if ('minimum_sell_price' in data) {
    errors.push("minimum_sell_price is always derived and must not be supplied");
  }
  if ('is_sold' in data) {
    errors.push("is_sold must not be set by external clients");
  }

  // Value type validation
  if (!data.value_type) {
    errors.push("value_type is required");
  } else if (!VALID_VALUE_TYPES.includes(data.value_type)) {
    errors.push(`value_type must be one of: ${VALID_VALUE_TYPES.join(", ")}`);
  }

  // Value field validation
  if (typeof data.value !== "string" || !data.value.trim()) {
    errors.push("value is required (cannot be empty)");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateCouponInput,
  VALID_VALUE_TYPES,
};


