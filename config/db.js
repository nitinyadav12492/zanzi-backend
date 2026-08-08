// config/db.js — MongoDB Connection
const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/zanzee";

  try {
    const conn = await mongoose.connect(uri);
    console.log(` MongoDB Connected: ${conn.connection.host}`);
    return;
  } catch (error) {
    console.error(` MongoDB Error connecting to ${uri}: ${error.message}`);

    if (uri !== "mongodb://127.0.0.1:27017/zanzee") {
      const fallback = "mongodb://127.0.0.1:27017/zanzee";
      console.warn(`Attempting fallback to local MongoDB at ${fallback}`);
      try {
        const conn = await mongoose.connect(fallback);
        console.log(` MongoDB Connected to local fallback: ${conn.connection.host}`);
        return;
      } catch (fallbackError) {
        console.error(` Local MongoDB fallback failed: ${fallbackError.message}`);
      }
    }

    process.exit(1);
  }
};

module.exports = connectDB;