const mongoose = require("mongoose");
const COLLECTION_NAME = "Cart";

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  items: [
    {
      seriesId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Series",
        required: true,
      },
      quantity: { type: Number, required: true, min: 1 },
      type: {
        type: String,
        enum: ["set", "single"],
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model(COLLECTION_NAME, cartSchema);
