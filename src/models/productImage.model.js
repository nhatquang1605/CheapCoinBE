const mongoose = require("mongoose");
const COLLECTION_NAME = "ProductImages";

const productImageSchema = new mongoose.Schema({
  productID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Products",
    required: true,
  },
  imageURL: {
    type: String,
    required: true,
  },
  isPrimary: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model(COLLECTION_NAME, productImageSchema);
