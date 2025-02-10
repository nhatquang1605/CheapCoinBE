const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Gửi email OTP
 * @param {string} to - Email người nhận
 * @param {string} subject - Chủ đề email
 * @param {string} text - Nội dung email
 */
const sendMail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"CheapCoin" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    });
    console.log(`📧 Email đã gửi tới: ${to}`);
  } catch (error) {
    console.error("❌ Lỗi gửi email:", error);
    throw new Error("Không thể gửi email");
  }
};

module.exports = sendMail;
