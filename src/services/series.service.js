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

const getAllSeries = async (page, limit, skip) => {
  const total = await Series.countDocuments(); // Tổng số lượng series
  const series = await Series.find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo mới nhất

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: series,
  };
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
