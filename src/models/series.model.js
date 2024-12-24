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
    TotalCharacters: {
      type: Number,
      enum: [6, 12],
      required: true,
    },
    RepresentativeImageURL: {
      type: String,
    },
    Size: {
      type: String,
    },
    Material: {
      type: String,
    },
    AgeToUse: {
      type: String,
    },
    SecretCharacterID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
      default: null,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = mongoose.model(COLLECTION_NAME, SeriesSchema);
