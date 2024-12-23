const mongoose = require("mongoose");
const COLLECTION_NAME = "Customers";

const CustomerSchema = new mongoose.Schema(
  {
    FullName: {
      type: String,
      required: true,
    },
    Email: {
      type: String,
      required: true,
      unique: true,
    },
    Password: {
      type: String,
      required: true,
    }, // Mã hóa mật khẩu khi lưu
    PhoneNumber: {
      type: String,
    },
    Address: {
      type: String,
    },
    JoinDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

// Mã hóa mật khẩu trước khi lưu
CustomerSchema.pre("save", async function (next) {
  if (!this.isModified("Password")) return next(); // Nếu Password không thay đổi
  this.Password = await bcrypt.hash(this.Password, 10); // Mã hóa
  next();
});

// Hàm so sánh mật khẩu khi đăng nhập
CustomerSchema.methods.comparePassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.Password);
};

module.exports = mongoose.model(COLLECTION_NAME, CustomerSchema);
