// routes/authRoutes.js
const express = require("express");
const router  = express.Router();
const { signup, login, verifyEmail, resendOTP, getProfile, updateProfile, getAllUsers } = require("../controllers/authController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOTP);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.get("/users", protect, adminOnly, getAllUsers);

// Debug endpoint to check environment variables (remove in production)
router.get("/debug", (req, res) => {
  res.json({
    environment: process.env.NODE_ENV,
    emailUser: process.env.EMAIL_USER ? "SET" : "NOT SET",
    emailPass: process.env.EMAIL_PASS ? "SET (" + process.env.EMAIL_PASS.length + " chars)" : "NOT SET",
    mongoUri: process.env.MONGODB_URI ? "SET" : "NOT SET",
    jwtSecret: process.env.JWT_SECRET ? "SET" : "NOT SET",
    port: process.env.PORT,
  });
});

module.exports = router;