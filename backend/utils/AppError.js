class AppError extends Error {
  /**
   * @param {string} errorCode  - machine-readable code e.g. PRODUCT_NOT_FOUND
   * @param {string} message    - human-readable message
   * @param {number} statusCode - HTTP status
   */
  constructor(errorCode, message, statusCode = 400) {
    super(message);
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Convenience factory methods
AppError.notFound = (resource = "Resource") =>
  new AppError("PRODUCT_NOT_FOUND", `${resource} not found`, 404);

AppError.alreadySold = () =>
  new AppError("PRODUCT_ALREADY_SOLD", "This product has already been sold", 409);

AppError.priceTooLow = (minPrice) =>
  new AppError(
    "RESELLER_PRICE_TOO_LOW",
    `Reseller price must be >= ${minPrice}`,
    400
  );

AppError.unauthorized = (msg = "Unauthorized") =>
  new AppError("UNAUTHORIZED", msg, 401);

AppError.forbidden = (msg = "Forbidden") =>
  new AppError("FORBIDDEN", msg, 403);

AppError.validation = (msg) =>
  new AppError("VALIDATION_ERROR", msg, 422);

module.exports = AppError;
