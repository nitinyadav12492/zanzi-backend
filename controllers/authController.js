// controllers/authController.js — Auth Logic
const User = require("../models/User");
const Verification = require("../models/Verification");
const { generateOTP, sendVerificationEmail } = require("../services/emailService");
const jwt  = require("jsonwebtoken");

// Generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ── POST /api/auth/signup ─────────────────────────────────────
const signup = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    console.log("📝 Signup attempt:", { name, email, phone });

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ message: "Please enter a valid email address" });

    console.log("Checking if user exists...");
    // Check if email already exists (verified or not)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ message: "Email already registered" });
      } else {
        // If unverified, allow resending OTP
        await Verification.findOneAndDelete({ email });
      }
    }

    // Generate OTP and send email
    const otp = generateOTP();
    console.log(`📧 Sending OTP to ${email}:`, otp);
    await sendVerificationEmail(email, otp);

    // Store verification data
    console.log("💾 Storing verification data...");
    await Verification.findOneAndUpdate(
      { email },
      {
        email,
        otp,
        userData: { name, password, phone },
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
      { upsert: true, new: true }
    );

    console.log("✅ Signup successful for:", email);
    res.status(200).json({ message: "Verification code sent to your email. Please verify to complete signup." });
  } catch (err) {
    console.error("❌ Signup error:", err.message || err);
    console.error("Stack:", err.stack);
    res.status(500).json({ message: `Signup failed: ${err.message || "Unknown error"}` });
  }
};

// ── POST /api/auth/verify-email ─────────────────────────────────
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required" });

    const verification = await Verification.findOne({ email, otp });
    if (!verification)
      return res.status(400).json({ message: "Invalid or expired verification code" });

    // Create the user
    const user = await User.create({
      name: verification.userData.name,
      email: verification.email,
      password: verification.userData.password,
      phone: verification.userData.phone,
      isVerified: true,
    });

    // Delete verification record
    await Verification.findOneAndDelete({ email });

    res.status(201).json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ message: err.message });
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid email or password" });

    if (!user.isVerified)
      return res.status(401).json({ message: "Please verify your email before logging in" });

    res.json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/auth/resend-otp ─────────────────────────────────
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "Email is required" });

    const verification = await Verification.findOne({ email });
    if (!verification)
      return res.status(400).json({ message: "No pending verification found for this email" });

    // Generate new OTP and send email
    const otp = generateOTP();
    await sendVerificationEmail(email, otp);

    // Update verification record
    verification.otp = otp;
    verification.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await verification.save();

    res.status(200).json({ message: "New verification code sent to your email." });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ message: "Failed to resend verification code. Please try again." });
  }
};
const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json(user);
};

// ── PUT /api/auth/profile ─────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.name    = req.body.name    || user.name;
    user.phone   = req.body.phone   || user.phone;
    user.address = req.body.address || user.address;
    if (req.body.password) user.password = req.body.password;
    const updated = await user.save();
    res.json({ _id: updated._id, name: updated.name, email: updated.email, role: updated.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/auth/users (admin) ───────────────────────────────
const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password").sort("-createdAt");
  res.json(users);
};

module.exports = { signup, login, verifyEmail, resendOTP, getProfile, updateProfile, getAllUsers };
