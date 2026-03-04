require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const { PORT } = require("./config/env");
const { connect } = require("./db/mongoose");
const errorHandler = require("./middleware/errorHandler");

// Routes
const healthRoutes = require("./routes/health");
const adminAuthRoutes = require("./routes/adminAuth");
const adminProductsRoutes = require("./routes/adminProducts");
const customerShopRoutes = require("./routes/customerShop");
const resellerProductsRoutes = require("./routes/resellerProductsV1");

// Seed on first run
const { seedIfNeeded } = require("./seed/seed");

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads (if locally stored images)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/health", healthRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/products", adminProductsRoutes);
app.use("/api/shop", customerShopRoutes);
app.use("/api/v1/products", resellerProductsRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error_code: "NOT_FOUND", message: "Route not found" });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── Boot ──────────────────────────────────────────────────────────────────────
const start = async () => {
  await connect();
  await seedIfNeeded();
  app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
  });
};

start().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});

module.exports = app;
