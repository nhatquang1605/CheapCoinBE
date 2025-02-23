const Merchandise = require("../models/merchandise.model");

const createMerchandise = async (data) => {
  return await Merchandise.create(data);
};

const getAllMerchandise = async () => {
  return await Merchandise.find();
};

const getMerchandiseById = async (id) => {
  const merchandise = await Merchandise.findById(id);
  if (!merchandise) throw new Error("Merchandise not found");
  return merchandise;
};

const updateMerchandise = async (id, data) => {
  const merchandise = await Merchandise.findByIdAndUpdate(id, data, {
    new: true,
  });
  if (!merchandise) throw new Error("Merchandise not found");
  return merchandise;
};

const deleteMerchandise = async (id) => {
  const merchandise = await Merchandise.findByIdAndDelete(id);
  if (!merchandise) throw new Error("Merchandise not found");
  return merchandise;
};

module.exports = {
  createMerchandise,
  getAllMerchandise,
  getMerchandiseById,
  updateMerchandise,
  deleteMerchandise,
};
