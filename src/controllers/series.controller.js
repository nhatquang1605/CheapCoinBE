const { date } = require("joi");
const { addSeries } = require("../services/series.service");

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

module.exports = { createSeries };
