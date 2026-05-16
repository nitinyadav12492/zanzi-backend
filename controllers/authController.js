// controllers/authController.js — Auth Logic
const User = require("../models/User");
const Verification = require("../models/Verification");
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

    const normalizedEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail))
      return res.status(400).json({ message: "Please enter a valid email address" });

    let existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser?.isVerified) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // If the user has already started signup but not verified yet, update their draft record.
    if (!existingUser) {
      existingUser = await User.create({
        name,
        email: normalizedEmail,
        password,
        phone,
        isVerified: true,
      });
    } else {
      existingUser.name = name;
      existingUser.password = password;
      existingUser.phone = phone;
      existingUser.isVerified = true;
      await existingUser.save();
    }

    // Return user data so frontend can auto-login
    res.status(201).json({
      message: "Account created successfully",
      _id: existingUser._id,
      name: existingUser.name,
      email: existingUser.email,
      role: existingUser.role,
      token: generateToken(existingUser._id),
    });
  } catch (err) {
    console.error("❌ Signup error:", err.message || err);
    console.error("Stack:", err.stack);
    res.status(500).json({ message: err.message || "Signup failed" });
  }
};

// ── POST /api/auth/login ─────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email or username and password are required" });
    }

    const normalizedInput = email.toLowerCase().trim();
    console.log("🔍 Login attempt for:", normalizedInput);

    const user = await User.findOne({
      $or: [
        { email: normalizedInput },
        { name: { $regex: new RegExp(`^${normalizedInput.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
      ],
    });

    console.log("📋 User found:", !!user, user?.email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email/username or password" });
    }

    const passwordMatch = await user.matchPassword(password);
    console.log("🔑 Password match:", passwordMatch);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email/username or password" });
    }

    // Account verified — auto-login
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/auth/verify-email ───────────────────────────────
const verifyEmail = async (req, res) => {
  // Email verification is disabled — users auto-verify on signup
  res.status(410).json({ message: "Email verification is disabled" });
};

// ── POST /api/auth/resend-otp ────────────────────────────────
const resendOTP = async (req, res) => {
  // OTP system is disabled — users auto-verify on signup
  res.status(410).json({ message: "OTP system is disabled" });
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
