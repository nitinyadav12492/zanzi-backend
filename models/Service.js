// models/Service.js — Service Schema
const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    category:    { type: String, required: true },
    description: { type: String, required: true },
    price:       { type: Number, default: 0 },
    icon:        { type: String, default: "🔧" },
    isActive:    { type: Boolean, default: true },
    subServices: [{ type: String }], // e.g. ["Light repair", "Wiring"]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);