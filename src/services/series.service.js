const Series = require("../models/series.model");

const addSeries = async (data) => {
  try {
    const series = new Series(data);
    await series.save(series);
    return series;
  } catch (error) {
    throw new Error("Error creating series: " + error.message);
  }
};

module.exports = { addSeries };
