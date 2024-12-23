const mongoose = require("mongoose");
const COLLECTION_NAME = "Merchandises";

const MerchandiseSchema = new mongoose.Schema(
  {
    ProductName: {
      type: String,
      required: true,
    },
    Description: {
      type: String,
    },
    Price: {
      type: Number,
      required: true,
    },
    StockQuantity: {
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
