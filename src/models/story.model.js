const mongoose = require("mongoose");
const COLLECTION_NAME = "Stories";

const storySchema = new mongoose.Schema({
  seriesID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Series",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
  },
  author: {
    type: String,
  },
});

module.exports = mongoose.model(COLLECTION_NAME, storySchema);
