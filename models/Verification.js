// models/Verification.js — Email Verification Schema
const mongoose = require("mongoose");

const verificationSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true, default: () => new Date(Date.now() + 10 * 60 * 1000) }, // 10 minutes
    userData: {
      name: { type: String, required: true },
      password: { type: String, required: true },
      phone: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

// Index to auto-delete expired verifications
verificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Verification", verificationSchema);