// routes/cartRoutes.js — Cart Routes (Protected)
const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getCart, addToCart, removeFromCart, clearCart } = require("../controllers/cartController");

const router = express.Router();

// All cart routes require authentication
router.use(protect);

router.get("/", getCart);
router.post("/add", addToCart);
router.post("/remove", removeFromCart);
router.delete("/clear", clearCart);

module.exports = router;