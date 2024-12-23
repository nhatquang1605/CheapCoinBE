const mongoose = require("mongoose");
const COLLECTION_NAME = "Orders";

const OrderItemSchema = new mongoose.Schema({
  ProductID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  Quantity: {
    type: Number,
    required: true,
  },
});

const OrderSchema = new mongoose.Schema(
  {
    CustomerID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    Items: [OrderItemSchema],
    TotalAmount: { type: Number, required: true },
    OrderDate: { type: Date, default: Date.now },
    Status: {
      type: String,
      enum: ["Pending", "Shipped", "Completed", "Cancelled"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = mongoose.model(COLLECTION_NAME, OrderSchema);
