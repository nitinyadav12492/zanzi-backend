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

module.exports = router;