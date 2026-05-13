// services/emailService.js — Email Service
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com";
const emailPort = Number(process.env.EMAIL_PORT || 465);
const emailSecure = process.env.EMAIL_SECURE !== "false";
const rejectUnauthorized = process.env.NODE_ENV === "production";
const hasEmailConfig = Boolean(emailUser && emailPass);

const transporter = hasEmailConfig
  ? nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailSecure,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      tls: {
        rejectUnauthorized,
      },
      logger: false,
      debug: false,
    })
  : null;

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

const sendVerificationEmail = async (email, otp) => {
  console.log(`Verification OTP for ${email}: ${otp}`); // For testing, log to console

  if (!transporter) {
    console.warn("Email transport is not configured. OTP is logged only.");
    return;
  }

  const mailOptions = {
    from: emailUser,
    to: email,
    subject: "Email Verification - Zanzee",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Zanzee!</h2>
        <p>Your verification code is:</p>
        <h1 style="color: #007bff; font-size: 32px;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.warn("Email send failed, OTP logged to console instead:", err.message || err);
  }
};

module.exports = { generateOTP, sendVerificationEmail };