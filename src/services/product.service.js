const Product = require("../models/product.model");
const ProductImage = require("../models/productImage.model");
const Series = require("../models/series.model");

const addProduct = async (productData) => {
  const newProduct = new Product(productData);
  return await newProduct.save();
};

const saveProductImages = async (imageRecords) => {
  return await ProductImage.insertMany(imageRecords);
};

const checkSeriesExistence = async (seriesID) => {
  return await Series.exists({ _id: seriesID });
};

module.exports = {
  addProduct,
  saveProductImages,
  checkSeriesExistence,
};
