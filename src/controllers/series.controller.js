const { date } = require("joi");
const {
  addSeries,
  getAllSeries,
  getSeriesById,
} = require("../services/series.service");

const createSeries = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      totalCharacters,
      size,
      material,
      ageToUse,
    } = req.body;
    const representativeImageURL = req.file ? req.file.path : null;

    if (!representativeImageURL) {
      return res
        .status(400)
        .json({ message: "Representative image is required" });
    }

    const releaseDate = Date.now();
    const newSeries = await addSeries({
      name,
      description,
      price,
      releaseDate,
      totalCharacters,
      size,
      material,
      ageToUse,
      representativeImageURL,
    });

    res
      .status(201)
      .json({ message: "Series created successfully", series: newSeries });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const seriesList = await getAllSeries();
    res.status(200).json({ success: true, data: seriesList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID từ params
    const series = await getSeriesById(id);
    res.status(200).json({ success: true, data: series });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

module.exports = { createSeries, getAll, getById };
