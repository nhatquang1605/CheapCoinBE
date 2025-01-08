const {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProductById,
  checkMainProductExist,
} = require("../services/product.service");
const { checkSeriesExistence } = require("../services/series.service");
const { extractPublicId } = require("../helper/cloudinaryHelper");
const { validateProductData } = require("../validation/product.validation");
const { uploadFilesToCloudinary } = require("../utils/cloudinaryUtils");
const fs = require("fs").promises;

const createProduct = async (req, res) => {
  try {
    const {
      productName,
      description,
      stockQuantity,
      seriesID,
      isSpecialEdition,
      isMainInSeries,
      releaseDate,
    } = req.body;

    // Kiểm tra file ảnh (chỉ cho phép 1 ảnh duy nhất)
    const file = req.file; // Sử dụng `req.file` nếu cấu hình multer chỉ cho phép upload 1 file
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Product must have an image",
      });
    }

    // Kiểm tra series tồn tại
    const isSeriesValid = await checkSeriesExistence(seriesID);
    if (!isSeriesValid) {
      await fs.unlink(file.path); // Xóa file tạm nếu series không tồn tại
      return res.status(404).json({
        success: false,
        message: "Series does not exist",
      });
    }

    // Kiểm tra xem series đã có sản phẩm chính (mainProduct) chưa
    const existingMainProduct = await checkMainProductExist(seriesID);

    if (existingMainProduct) {
      await fs.unlink(file.path); // Xóa file tạm nếu đã có mainProduct
      return res.status(400).json({
        success: false,
        message: "Series already has a main product",
      });
    }

    // Validate dữ liệu đầu vào
    const { error } = validateProductData(req.body);
    if (error) {
      await fs.unlink(file.path); // Xóa file tạm nếu dữ liệu không hợp lệ
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((err) => err.message),
      });
    }

    // Upload file lên Cloudinary
    const uploadedImage = await uploadFilesToCloudinary([file]);

    // Tạo sản phẩm
    const newProduct = await addProduct({
      productName,
      description,
      stockQuantity,
      seriesID,
      isSpecialEdition,
      releaseDate,
      isMainInSeries,
      imageUrl: uploadedImage.data[0].url, // Lưu URL ảnh từ Cloudinary
    });

    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const products = await getAllProducts();
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  const { productName, description, stockQuantity, removedImages } = req.body;

  const { error } = validateProductData(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      errors: error.details.map((err) => err.message),
    });
  }

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // **Xóa ảnh cũ nếu có chỉ định từ FE**
    if (removedImages && removedImages.length > 0) {
      for (const url of removedImages) {
        const publicId = extractPublicId(url);
        await cloudinary.uploader.destroy(publicId);
        product.imageUrls = product.imageUrls.filter((img) => img !== url);
      }
    }

    // **Upload ảnh mới (nếu có)**
    const newImageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        newImageUrls.push(result.secure_url);
      }
    }

    // **Cập nhật product trong database**
    product.productName = productName || product.productName;
    product.description = description || product.description;
    product.stockQuantity = stockQuantity || product.stockQuantity;
    product.imageUrls = [...product.imageUrls, ...newImageUrls];

    await product.save();

    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await deleteProductById(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createProduct,
  getAll,
  getById,
  update,
  deleteProduct,
};
