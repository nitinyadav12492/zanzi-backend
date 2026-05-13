// models/Booking.js — Booking Schema
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name:        { type: String, required: true },
    phone:       { type: String, required: true },
    address:     { type: String, required: true },
    serviceType: { type: String, required: true },
    date:        { type: Date, required: true },
    status:      { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending" },
    notes:       { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);