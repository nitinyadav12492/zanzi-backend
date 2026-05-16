// controllers/authController.js — Auth Logic
const User = require("../models/User");
const Verification = require("../models/Verification");
const jwt  = require("jsonwebtoken");
const { generateOTP, sendVerificationEmail } = require("../services/emailService");

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
        isVerified: false,
      });
    } else {
      existingUser.name = name;
      existingUser.password = password;
      existingUser.phone = phone;
      await existingUser.save();
    }

    // Generate OTP and send email
    const otp = generateOTP();
    console.log(`🔐 Generated OTP for ${normalizedEmail}: ${otp}`);

    // Save to verification DB
    await Verification.findOneAndUpdate(
      { email: normalizedEmail },
      { email: normalizedEmail, otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
      { upsert: true }
    );

    // Send email with OTP
    try {
      await sendVerificationEmail(normalizedEmail, otp);
    } catch (emailErr) {
      console.error("⚠️ Email failed, but OTP saved:", emailErr.message);
    }

    // Store signup data temporarily for later verification
    res.status(200).json({
      message: "Verification code sent to your email",
      email: normalizedEmail,
      tempData: { name, email: normalizedEmail, password, phone },
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
    const user = await User.findOne({
      $or: [
        { email: normalizedInput },
        { name: { $regex: new RegExp(`^${normalizedInput.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
      ],
    });

    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid email/username or password" });

    if (!user.isVerified)
      return res.status(403).json({ message: "Please verify your email first" });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/auth/verify-email ───────────────────────────────
const verifyEmail = async (req, res) => {
  try {
    const { email, otp, name, password, phone } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Check OTP
    const verification = await Verification.findOne({ email: normalizedEmail });
    if (!verification || verification.otp !== otp) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    // Confirm existing user or create a new one
    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      user.isVerified = true;
      user.name = name || user.name;
      user.phone = phone || user.phone;
      if (password) user.password = password;
      await user.save();
    } else {
      user = await User.create({
        name,
        email: normalizedEmail,
        password,
        phone,
        isVerified: true,
      });
    }

    // Delete verification record
    await Verification.deleteOne({ email: normalizedEmail });

    res.status(201).json({
      message: "Email verified successfully",
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("❌ Verification error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/auth/resend-otp ────────────────────────────────
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Generate new OTP
    const otp = generateOTP();
    console.log(`🔐 Resent OTP for ${normalizedEmail}: ${otp}`);

    // Update verification
    await Verification.findOneAndUpdate(
      { email: normalizedEmail },
      { otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
      { upsert: true }
    );

    // Send email
    try {
      await sendVerificationEmail(normalizedEmail, otp);
    } catch (emailErr) {
      console.error("⚠️ Email failed:", emailErr.message);
    }

    res.json({ message: "Verification code resent to your email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
