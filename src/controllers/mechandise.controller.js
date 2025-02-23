const MerchandiseService = require("../services/merchandise.service");

const createMerchandise = async (req, res) => {
  try {
    const merchandise = await MerchandiseService.createMerchandise(req.body);
    res.status(201).json(merchandise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllMerchandise = async (req, res) => {
  try {
    const merchandise = await MerchandiseService.getAllMerchandise();
    res.json(merchandise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMerchandiseById = async (req, res) => {
  try {
    const merchandise = await MerchandiseService.getMerchandiseById(
      req.params.id
    );
    res.json(merchandise);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateMerchandise = async (req, res) => {
  try {
    const merchandise = await MerchandiseService.updateMerchandise(
      req.params.id,
      req.body
    );
    res.json(merchandise);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const deleteMerchandise = async (req, res) => {
  try {
    await MerchandiseService.deleteMerchandise(req.params.id);
    res.json({ message: "Merchandise deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  createMerchandise,
  getAllMerchandise,
  getMerchandiseById,
  updateMerchandise,
  deleteMerchandise,
};
