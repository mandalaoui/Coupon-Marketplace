const AppError = require("../utils/AppError");

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message).join("; ");
    return res.status(422).json({ error_code: "VALIDATION_ERROR", message: messages });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {}).join(", ");
    return res.status(409).json({ error_code: "DUPLICATE_KEY", message: `Duplicate value for: ${field}` });
  }

  // JWT error
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ error_code: "UNAUTHORIZED", message: "Invalid or expired token" });
  }

  // Operational (AppError)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error_code: err.errorCode,
      message: err.message,
    });
  }

  // Unknown errors — don't leak internals
  console.error("UNHANDLED ERROR:", err);
  return res.status(500).json({
    error_code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
  });
};

module.exports = errorHandler;
