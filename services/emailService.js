// // services/emailService.js — Email Service
// const nodemailer = require("nodemailer");
// const crypto = require("crypto");

// const emailUser = process.env.EMAIL_USER;
// const emailPass = process.env.EMAIL_PASS;
// const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com";
// const emailPort = Number(process.env.EMAIL_PORT || 465);
// const emailSecure = process.env.EMAIL_SECURE !== "false";
// const rejectUnauthorized = process.env.NODE_ENV === "production";
// const hasEmailConfig = Boolean(emailUser && emailPass);

// const transporter = hasEmailConfig
//   ? nodemailer.createTransport({
//       host: emailHost,
//       port: emailPort,
//       secure: emailSecure,
//       auth: {
//         user: emailUser,
//         pass: emailPass,
//       },
//       tls: {
//         rejectUnauthorized: false, // Allow self-signed certificates for development
//       },
//       logger: true,
//       debug: true,
//     })
//   : null;

// // Test transporter on startup
// if (transporter) {
//   console.log("📧 Email transporter configured for:", emailUser);
//   console.log("📧 Email config - Host:", emailHost, "Port:", emailPort, "Secure:", emailSecure);

//   transporter.verify((error, success) => {
//     if (error) {
//       console.error("❌ Email transporter verification failed:", error.message);
//       console.error("Full error:", error);
//     } else {
//       console.log("✅ Email transporter is ready to send emails");
//     }
//   });
// } else {
//   console.warn("⚠️ Email transporter not configured - missing EMAIL_USER or EMAIL_PASS");
//   console.log("EMAIL_USER:", emailUser ? "SET" : "NOT SET");
//   console.log("EMAIL_PASS:", emailPass ? "SET (" + emailPass.length + " chars)" : "NOT SET");
// }

// const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// const sendVerificationEmail = async (email, otp) => {
//   console.log(`📧 Attempting to send OTP to ${email}: ${otp}`);

//   if (!transporter) {
//     console.warn("⚠️ Email transport not configured. OTP logged to console only.");
//     return;
//   }

//   const mailOptions = {
//     from: `"Zanzee Services" <${emailUser}>`,
//     to: email,
//     subject: "Email Verification - Zanzee",
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
//         <h2 style="color: #333; text-align: center;">Welcome to Zanzee!</h2>
//         <p style="font-size: 16px;">Your verification code is:</p>
//         <div style="text-align: center; margin: 30px 0;">
//           <span style="font-size: 32px; font-weight: bold; color: #007bff; background: #f8f9fa; padding: 10px 20px; border-radius: 5px; letter-spacing: 3px;">${otp}</span>
//         </div>
//         <p style="font-size: 14px; color: #666;">This code will expire in 10 minutes.</p>
//         <p style="font-size: 14px; color: #666;">If you didn't request this, please ignore this email.</p>
//         <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
//         <p style="font-size: 12px; color: #999; text-align: center;">Zanzee Home Services</p>
//       </div>
//     `,
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log(`✅ Email sent successfully to ${email}. Message ID: ${info.messageId}`);
//     return { success: true, messageId: info.messageId };
//   } catch (err) {
//     console.error(`❌ Email send failed for ${email}:`, err.message);
//     console.error("Full error:", err);
//     return { success: false, error: err.message };
//   }
// };

// module.exports = { generateOTP, sendVerificationEmail };
// services/emailService.js — Email Service
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

const hasEmailConfig = Boolean(emailUser && emailPass);

// const transporter = hasEmailConfig
//   ? nodemailer.createTransport({
//       host: "smtp.gmail.com",
//       port: 465,
//       secure: true,

//       auth: {
//         user: emailUser,
//         pass: emailPass,
//       },

//       connectionTimeout: 30000,
//       greetingTimeout: 30000,
//       socketTimeout: 30000,
//     })
//   : null;
const transporter = hasEmailConfig
  ? nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,

      auth: {
        user: emailUser,
        pass: emailPass,
      },

      connectionTimeout: 60000,
      greetingTimeout: 60000,
      socketTimeout: 60000,
    })
  : null;
// Verify transporter
if (transporter) {
  console.log("📧 Email transporter configured for:", emailUser);

  transporter.verify((error) => {
    if (error) {
      console.error("❌ Email transporter verification failed:", error.message);
    } else {
      console.log("✅ Email transporter is ready");
    }
  });
} else {
  console.warn("⚠️ Email transporter not configured");
  console.log("EMAIL_USER:", emailUser ? "SET" : "NOT SET");
  console.log("EMAIL_PASS:", emailPass ? "SET" : "NOT SET");
}

// Generate 6 digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send OTP email
const sendVerificationEmail = async (email, otp) => {
  console.log(`📧 Sending OTP to ${email}`);

  if (!transporter) {
    return {
      success: false,
      error: "Email transporter not configured",
    };
  }

  const mailOptions = {
    from: `"Zanzee Services" <${emailUser}>`,
    to: email,
    subject: "Email Verification - Zanzee",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Welcome to Zanzee!</h2>

        <p style="font-size: 16px;">Your verification code is:</p>

        <div style="text-align: center; margin: 30px 0;">
          <span style="
            font-size: 32px;
            font-weight: bold;
            color: #007bff;
            background: #f8f9fa;
            padding: 12px 24px;
            border-radius: 6px;
            letter-spacing: 4px;
            display: inline-block;
          ">
            ${otp}
          </span>
        </div>

        <p style="font-size: 14px; color: #666;">
          This code will expire in 10 minutes.
        </p>

        <p style="font-size: 14px; color: #666;">
          If you didn't request this, please ignore this email.
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />

        <p style="font-size: 12px; color: #999; text-align: center;">
          Zanzee Home Services
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("❌ Email send failed:", error.message);

    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  generateOTP,
  sendVerificationEmail,
};