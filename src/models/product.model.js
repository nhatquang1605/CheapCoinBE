const mongoose = require("mongoose");
const COLLECTION_NAME = "Products";

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
    IsSpecialEdition: {
      type: Boolean,
      default: false,
    },
    ReleaseDate: {
      type: Date,
    },
    IsNew: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = mongoose.model(COLLECTION_NAME, ProductSchema);
