// routes/authRoutes.js
const express = require("express");
const router  = express.Router();
const { signup, login, verifyEmail, resendOTP, getProfile, updateProfile, getAllUsers } = require("../controllers/authController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/signup",  signup);
router.post("/login",   login);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOTP);
router.get("/profile",  protect, getProfile);
router.put("/profile",  protect, updateProfile);
router.get("/users",    protect, adminOnly, getAllUsers);

// Test email endpoint (remove in production)
router.post("/test-email", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  const { generateOTP, sendVerificationEmail } = require("../services/emailService");
  const otp = generateOTP();

  try {
    const result = await sendVerificationEmail(email, otp);
    res.json({ message: "Test email sent", otp, emailResult: result });
  } catch (err) {
    res.status(500).json({ message: "Email test failed", error: err.message });
  }
});

// Debug endpoint to check environment variables (remove in production)
router.get("/debug", (req, res) => {
  res.json({
    environment: process.env.NODE_ENV,
    emailUser: process.env.EMAIL_USER ? "SET" : "NOT SET",
    emailPass: process.env.EMAIL_PASS ? "SET (" + process.env.EMAIL_PASS.length + " chars)" : "NOT SET",
    mongoUri: process.env.MONGODB_URI ? "SET" : "NOT SET",
    jwtSecret: process.env.JWT_SECRET ? "SET" : "NOT SET",
    port: process.env.PORT
  });
});

module.exports = router;