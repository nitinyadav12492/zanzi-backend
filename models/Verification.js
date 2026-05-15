// models/Verification.js — Email Verification Schema
const mongoose = require("mongoose");

const verificationSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 10 * 60 * 1000) }, // 10 minutes
  createdAt: { type: Date, default: Date.now },
});

// Index to auto-delete expired verifications
verificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Verification", verificationSchema);
