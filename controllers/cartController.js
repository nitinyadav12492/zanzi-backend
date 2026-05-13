// controllers/cartController.js — Cart Management
const Cart = require("../models/Cart");

// ── Get User's Cart ───────────────────────────────────────────
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.json({ items: [] });
    res.json({ items: cart.items });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── Add Item to Cart ──────────────────────────────────────────
const addToCart = async (req, res) => {
  const { serviceId: rawServiceId, name, price, img, desc, time, rating } = req.body;
  const serviceId = String(rawServiceId);

  try {
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(item => String(item.serviceId) === serviceId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({ serviceId, name, price, img, desc, time, rating, quantity: 1 });
    }

    await cart.save();
    res.json({ message: "Item added to cart", items: cart.items });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── Remove Item from Cart ─────────────────────────────────────
const removeFromCart = async (req, res) => {
  const { serviceId: rawServiceId, removeAll } = req.body;
  const serviceId = String(rawServiceId);

  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(item => String(item.serviceId) === serviceId);
    if (itemIndex === -1) return res.status(404).json({ message: "Item not in cart" });

    if (removeAll || cart.items[itemIndex].quantity === 1) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity -= 1;
    }

    await cart.save();
    res.json({ message: "Item removed from cart", items: cart.items });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── Clear Cart ────────────────────────────────────────────────
const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getCart, addToCart, removeFromCart, clearCart };