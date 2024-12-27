const mongoose = require("mongoose");
const COLLECTION_NAME = "Products";

const ProductSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    stockQuantity: {
      type: Number,
      required: true,
    },
    seriesID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Series",
      required: true,
    },
    isSpecialEdition: {
      type: Boolean,
      default: false,
    },
    releaseDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = mongoose.model(COLLECTION_NAME, ProductSchema);
