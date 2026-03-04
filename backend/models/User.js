const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password_hash: { type: String, required: true },
    role: { type: String, enum: ["admin"], default: "admin" },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password_hash);
};

userSchema.statics.hashPassword = async (plain) => bcrypt.hash(plain, 12);

// Never expose password_hash
userSchema.set("toJSON", {
  transform: (_, ret) => {
    delete ret.password_hash;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
