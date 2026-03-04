const mongoose = require("mongoose");
const { MONGO_URI } = require("../config/env");

const connect = async () => {
  await mongoose.connect(MONGO_URI);
  console.log("✅ MongoDB connected");
};

module.exports = { connect };
