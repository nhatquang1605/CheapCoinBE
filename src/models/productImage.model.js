const mongoose = require("mongoose");
const COLLECTION_NAME = "ProductImages";

const productImageSchema = new mongoose.Schema({
  ProductID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Products",
    required: true,
  },
  ImageURL: {
    type: String,
    required: true,
  },
  IsPrimary: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model(COLLECTION_NAME, productImageSchema);
