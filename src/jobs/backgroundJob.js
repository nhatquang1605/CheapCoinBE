const mongoose = require("mongoose");
const Series = require("../models/series.model");
const connectDB = require("../config/database");

const updateIsNew = async () => {
  try {
    // Đảm bảo đã kết nối MongoDB
    if (mongoose.connection.readyState !== 1) {
      console.log("🔄 Connecting to MongoDB...");
      await connectDB();
    }

    console.log("Running job: Checking 'isNew' field update...");
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const result = await Series.updateMany(
      { releaseDate: { $lte: threeMonthsAgo }, isTagNew: true },
      { $set: { isNew: false } }
    );

    console.log(
      `✅ ${result.modifiedCount} series updated successfully: 'isNew' set to false.`
    );
  } catch (error) {
    console.error("❌ Error updating 'isNew' field:", error.message);
  }
};

module.exports = updateIsNew;
