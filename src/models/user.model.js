const mongoose = require("mongoose");
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
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

// Mã hóa mật khẩu trước khi lưu
UsersSchema.pre("save", async function (next) {
  if (!this.isModified("Password")) return next(); // Nếu Password không thay đổi
  this.Password = await bcrypt.hash(this.Password, 10); // Mã hóa
  next();
});

// Hàm so sánh mật khẩu khi đăng nhập
UsersSchema.methods.comparePassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.Password);
};

module.exports = mongoose.model(COLLECTION_NAME, UsersSchema);
