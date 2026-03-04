const AppError = require("../utils/AppError");

/**
 * Returns middleware that validates req.body against a Joi schema.
 */
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const msg = error.details.map((d) => d.message).join("; ");
    return next(AppError.validation(msg));
  }
  next();
};

module.exports = validate;
