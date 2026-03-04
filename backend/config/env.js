require("dotenv").config();

const required = (key) => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
};

module.exports = {
  PORT: process.env.PORT || 12345,
  MONGO_URI: required("MONGO_URI"),
  JWT_SECRET: required("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  RESELLER_TOKENS: (process.env.RESELLER_TOKENS || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean),
  ADMIN_SEED_EMAIL: process.env.ADMIN_SEED_EMAIL,
  ADMIN_SEED_PASSWORD: process.env.ADMIN_SEED_PASSWORD,
  NODE_ENV: process.env.NODE_ENV || "development",
};
