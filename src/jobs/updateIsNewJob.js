const Series = require("../models/series.model"); // Import model Series

const updateIsNew = async () => {
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // Tìm và cập nhật các series
    const result = await Series.updateMany(
      { releaseDate: { $lte: threeMonthsAgo }, isTagNew: true },
      { $set: { isNew: false } }
    );

    console.log(
      `${result.modifiedCount} series updated successfully: 'isNew' set to false.`
    );
  } catch (error) {
    console.error("Error updating 'isNew' field:", error.message);
  }
};

module.exports = updateIsNew;
