const mongoose = require("mongoose");
const COLLECTION_NAME = "Merchandises";

const MerchandiseSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    stockQuantity: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = mongoose.model(COLLECTION_NAME, MerchandiseSchema);
