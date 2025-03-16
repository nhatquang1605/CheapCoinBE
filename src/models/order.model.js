const mongoose = require("mongoose");
const crypto = require("crypto");
const COLLECTION_NAME = "Orders";

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "done", "cancelled", "payment_fail"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "payos"], // Chỉ chấp nhận 2 phương thức
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    shippingStatus: {
      type: String,
      enum: ["pending", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
    orderItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OrderItems",
      },
    ],
    orderCode: {
      type: Number,
      unique: true,
    },
  },
  { timestamps: true }
);

OrderSchema.pre("save", async function (next) {
  if (!this.orderCode) {
    this.orderCode = crypto.randomInt(1, 9007199254740991); // Random số hợp lệ
  }
  next();
});

module.exports = mongoose.model(COLLECTION_NAME, OrderSchema);
