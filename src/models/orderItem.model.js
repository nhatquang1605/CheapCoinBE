const mongoose = require("mongoose");
const COLLECTION_NAME = "OrderItems";

const OrderItemSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Orders", // Liên kết tới bảng Orders
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Series",
      required: true,
    },
    productName: { type: String, required: true },
    productPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model(COLLECTION_NAME, OrderItemSchema);
