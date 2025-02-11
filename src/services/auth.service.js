const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const sendMail = require("../services/mail.service");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRY,
    }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY,
  });
};

const register = async (fullName, email, password) => {
  let user = await User.findOne({ email });

  if (user && user.isVerified === false) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60000);
    await user.save();
    await sendMail(email, "Xác thực tài khoản", `Mã OTP của bạn là: ${otp}`);
    return { message: "OTP mới đã được gửi, vui lòng kiểm tra email" };
  }

  if (user) throw new Error("Email đã được đăng ký");

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user = new User({
    fullName,
    email,
    password: hashedPassword,
    role: "Customer",
    otp,
    isActive: false,
    otpExpiry: new Date(Date.now() + 5 * 60000),
  });
  await user.save();
  await sendMail(email, "Xác thực tài khoản", `Mã OTP của bạn là: ${otp}`);

  return { message: "OTP đã được gửi, vui lòng kiểm tra email" };
};

const verifyOTP = async (email, otp) => {
  const user = await User.findOne({ email });

  if (!user || user.otp !== otp || user.otpExpiry < new Date())
    throw new Error("OTP không hợp lệ hoặc đã hết hạn");

  user.isVerified = true;
  user.isActive = true;
  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  return { message: "Xác thực thành công, bạn có thể đăng nhập" };
};

const login = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user || !user.isVerified)
    throw new Error("Tài khoản chưa xác thực hoặc không tồn tại");
  if (!user.isActive) throw new Error("Tài khoản đã bị khóa");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new Error("Mật khẩu không chính xác");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};

const refreshToken = async (token) => {
  if (!token) throw new Error("Refresh token không hợp lệ");

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id);

  if (!user || user.refreshToken !== token)
    throw new Error("Refresh token không hợp lệ");

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);
  user.refreshToken = newRefreshToken;
  await user.save();

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

const logout = async (refreshToken) => {
  if (!refreshToken) {
    const error = new Error("No token provided");
    error.statusCode = 400;
    throw error;
  }

  // Giải mã refreshToken để lấy userId
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id);

  if (!user || user.refreshToken !== refreshToken) {
    const error = new Error("Invalid token");
    error.statusCode = 400;
    throw error;
  }

  // Xóa refreshToken trong DB
  user.refreshToken = null;
  await user.save();

  return { message: "Logout successful" };
};

const requestResetPassword = async (email, frontendUrl) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Email không tồn tại");

  const resetToken = jwt.sign({ email }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY,
  });
  user.resetToken = resetToken;
  user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // Hết hạn sau 15 phút
  await user.save();

  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`; // FE cung cấp URL
  await sendMail(
    user.email,
    "Đặt lại mật khẩu",
    `Bấm vào link sau để đặt lại mật khẩu: ${resetLink}`
  );
};

const verifyResetToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  const user = await User.findOne({
    email: decoded.email,
    resetToken: token,
  });
  if (!user || user.resetTokenExpiry < Date.now())
    throw new Error("Token không hợp lệ hoặc đã hết hạn");
};

const resetPassword = async (token, newPassword) => {
  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  const user = await User.findOne({ email: decoded.email, resetToken: token });
  if (!user || user.resetTokenExpiry < Date.now())
    throw new Error("Token không hợp lệ hoặc đã hết hạn");

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetToken = null;
  user.resetTokenExpiry = null;
  await user.save();
};

module.exports = {
  register,
  verifyOTP,
  login,
  refreshToken,
  logout,
  requestResetPassword,
  verifyResetToken,
  resetPassword,
};
