const mongoose = require("mongoose");
const COLLECTION_NAME = "Series";

const SeriesSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
    },
    Description: {
      type: String,
    },
    ReleaseDate: {
      type: Date,
      required: true,
    },
    SecretCharacter: {
      type: Boolean,
      default: false,
    }, // Nếu có secret character
    TotalCharacters: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = mongoose.model(COLLECTION_NAME, SeriesSchema);
