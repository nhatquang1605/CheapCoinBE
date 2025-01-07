const Product = require("../models/product.model");

const addProduct = async (productData) => {
  const newProduct = new Product(productData);
  return await newProduct.save();
};

const getAllProducts = async () => {
  return await Product.find().populate("seriesID");
};

const getProductById = async (id) => {
  return await Product.findById(id).populate("seriesID");
};

const updateProduct = async (id, productData) => {
  const { error } = validateProductData(productData);
  if (error) {
    throw new Error(error.details.map((err) => err.message).join(", "));
  }

  const updatedProduct = await Product.findByIdAndUpdate(id, productData, {
    new: true,
  }).populate("seriesID");
  if (!updatedProduct) {
    throw new Error("Product not found");
  }
  return updatedProduct;
};

const deleteProductById = async (id) => {
  const deletedProduct = await Product.findByIdAndDelete(id);
  if (!deletedProduct) {
    throw new Error("Product not found");
  }
  return deletedProduct;
};

const getAllProductsBySeriesId = async (id) => {
  return await Product.find({ seriesID: id });
};

module.exports = {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProductById,
  getAllProductsBySeriesId,
};
