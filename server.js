
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load env variables and override any existing system env values in development
dotenv.config({ override: true });

// Connect to MongoDB
console.log("Connecting to MongoDB...");
connectDB().then(() => {
  console.log("MongoDB connection established");
}).catch((err) => {
  console.error("MongoDB connection failed:", err.message);
  process.exit(1);
});

const app = express();
const allowedOrigins = [
  "https://zanzi.onrender.com",
  "https://zan-zi-frri.vercel.app",
  "https://zan-zi-green.vercel.app",
  "https://cerulean-piroshki-e46083.netlify.app",
  "https://jocular-marigold-d2bb25.netlify.app",
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow localhost for development
    if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
      return callback(null, true);
    }

    // Allow configured production frontends
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS policy blocked this origin"));
  },
  credentials: true,
}));

// ── Middleware ────────────────────────────────────────────────
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────
app.use("/api/auth",     require("./routes/authRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/cart",     require("./routes/cartRoutes"));

// Health check
app.get("/", (req, res) => res.json({ message: "🔧 Zanzee API running!" }));

// Health check without DB
app.get("/health", (req, res) => res.json({ 
  status: "ok", 
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV || "development"
}));

// ── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));