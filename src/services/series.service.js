const Series = require("../models/series.model");

const addSeries = async (data) => {
  try {
    const series = new Series(data);
    const savedSeries = await Series.create(data);
    return savedSeries;
  } catch (error) {
    throw new Error(`Error creating series: ${error.message}`);
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

const deleteSeriesById = async (id) => {
  try {
    const result = await Series.findByIdAndDelete(id);
    return result; // Trả về null nếu không tìm thấy
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateSeriesById = async (id, updatedData) => {
  try {
    const result = await Series.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true } // Trả về document sau khi cập nhật
    );
    return result; // Trả về null nếu không tìm thấy
  } catch (error) {
    throw new Error(error.message);
  }
};

const checkSeriesExistence = async (seriesID) => {
  return await Series.exists({ _id: seriesID });
};
module.exports = {
  addSeries,
  getAllSeries,
  getSeriesById,
  deleteSeriesById,
  updateSeriesById,
  checkSeriesExistence,
};
