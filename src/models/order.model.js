const mongoose = require("mongoose");
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
      enum: ["pending", "paid", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "payos"], // Chỉ chấp nhận 2 phương thức
      required: true,
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
  },
  { timestamps: true }
);

module.exports = mongoose.model(COLLECTION_NAME, OrderSchema);
