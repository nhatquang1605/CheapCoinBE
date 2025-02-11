const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const COLLECTION_NAME = "Users";

const UsersSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    }, // Mã hóa mật khẩu khi lưu
    role: {
      type: String,
      enum: ["Admin", "Customer"],
      required: true,
    },
    phoneNumber: {
      type: String,
    },
    address: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    }, // Xác thực email
    otp: {
      type: String,
    }, // Mã OTP
    otpExpiryTime: {
      type: Date,
    }, // Hạn OTP
    refreshToken: {
      type: String,
    },
    resetToken: {
      type: String,
    },
    resetTokenExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

// Mã hóa mật khẩu trước khi lưu
UsersSchema.pre("save", async function (next) {
  if (!this.isModified("Password")) return next(); // Nếu Password không thay đổi
  this.password = await bcrypt.hash(this.password, 10); // Mã hóa
  next();
});

// Hàm so sánh mật khẩu khi đăng nhập
UsersSchema.methods.comparePassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model(COLLECTION_NAME, UsersSchema);
