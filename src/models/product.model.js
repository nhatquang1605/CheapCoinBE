const mongoose = require("mongoose");
const COLLECTION_NAME = "Products";

const ImageSchema = new mongoose.Schema({
  ImageURL: {
    type: String,
    required: true,
  },
  IsPrimary: {
    type: Boolean,
    default: false,
  },
});

const ProductSchema = new mongoose.Schema(
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
    SeriesID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Series",
      required: true,
    },
    IsSpecialEdition: { type: Boolean, default: false },
    Images: [ImageSchema],
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = mongoose.model(COLLECTION_NAME, ProductSchema);
