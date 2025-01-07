const ProductImage = require("../models/productImage.model");

const saveProductImages = async (imageRecords) => {
  return await ProductImage.insertMany(imageRecords);
};

module.exports = { saveProductImages };
