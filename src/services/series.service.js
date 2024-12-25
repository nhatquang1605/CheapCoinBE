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

const getAllSeries = async () => {
  try {
    const seriesList = await Series.find(); // Tìm tất cả các series
    return seriesList;
  } catch (error) {
    throw new Error("Error fetching series list: " + error.message);
  }
};

const getSeriesById = async (id) => {
  try {
    const series = await Series.findById(id); // Tìm series theo ID
    if (!series) {
      throw new Error("Series not found");
    }
    return series;
  } catch (error) {
    throw new Error("Error fetching series by ID: " + error.message);
  }
};

module.exports = { addSeries, getAllSeries, getSeriesById };
