const mongoose = require("mongoose");
const COLLECTION_NAME = "Stories";

const storySchema = new mongoose.Schema({
  SeriesID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Series",
    required: true,
  },
  Title: {
    type: String,
    required: true,
  },
  Content: {
    type: String,
  },
  Author: {
    type: String,
  },
});

module.exports = mongoose.model(COLLECTION_NAME, storySchema);
