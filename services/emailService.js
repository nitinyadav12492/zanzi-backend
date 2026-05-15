// services/emailService.js — Email Service
const nodemailer = require("nodemailer");
const crypto = require("crypto");

let transporter;

const initializeTransporter = async () => {
  try {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();
    console.log("✅ Email transporter initialized");
  } catch (error) {
    console.error("❌ Email transporter failed:", error.message);
    transporter = null;
  }
};

initializeTransporter().catch(err => {
  console.error("❌ Failed to init email:", err.message);
});

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

const sendVerificationEmail = async (email, otp) => {
  console.log(`📧 Sending OTP to ${email}`);

  if (!transporter) {
    console.warn("⚠️ Email transport not configured");
    console.log(`📧 OTP for ${email}: ${otp}`);
    return;
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Email Verification - Zanzee",
      html: `<div style="font-family: Arial; max-width: 600px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0;">Zanzee</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px;">
          <p>Your verification code is:</p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #667eea;">${otp}</span>
          </div>
          <p>Code expires in 10 minutes.</p>
        </div>
      </div>`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send OTP: ${error.message}`);
    throw error;
  }
};

module.exports = { generateOTP, sendVerificationEmail };

