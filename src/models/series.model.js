const mongoose = require("mongoose");
const COLLECTION_NAME = "Series";

const SeriesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    totalCharacters: {
      type: Number,
      enum: [6, 12],
      required: true,
    },
    posterImageURL: {
      type: String,
    },
    size: {
      type: String,
    },
    material: {
      type: String,
    },
    ageToUse: {
      type: String,
    },
    secretCharacterID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
      default: null,
    },
    isAvailable: {
      type: Boolean,
      default: false,
    },
    isTagNew: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = mongoose.model(COLLECTION_NAME, SeriesSchema);
