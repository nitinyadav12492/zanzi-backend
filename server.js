// ============================================================
// server.js — Zanzee Backend Entry Point
// ============================================================
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
app.use(cors({
  origin: "https://cerulean-piroshki-e46083.netlify.app",
  credentials: true
}));

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: (origin, callback) => {
  if (!origin) return callback(null, true);
  const isLocalhost = origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:");
  if (isLocalhost) return callback(null, true);
  return callback(new Error("CORS policy blocked this origin"));
}, credentials: true }));
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────
app.use("/api/auth",     require("./routes/authRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/cart",     require("./routes/cartRoutes"));

// Health check
app.get("/", (req, res) => res.json({ message: "🔧 Zanzee API running!" }));

// ── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));