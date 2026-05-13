// models/Cart.js — Cart Schema linked to User
const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  serviceId: { type: String, required: true }, // Changed to String since services are static
  name: { type: String, required: true },
  price: { type: Number, required: true },
  img: { type: String },
  desc: { type: String },
  time: { type: String },
  rating: { type: String },
  quantity: { type: Number, default: 1 },
});

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  items: [cartItemSchema],
}, { timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);