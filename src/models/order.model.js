const mongoose = require("mongoose");
const COLLECTION_NAME = "Orders";

const OrderSchema = new mongoose.Schema(
  {
    customerID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    totalAmount: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
    status: {
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
