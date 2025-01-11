const {
  addProduct,
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById,
  checkMainProductExist,
} = require("../services/product.service");
const { checkSeriesExistence } = require("../services/series.service");
const {
  extractPublicId,
  generateHash,
  getCloudinaryETag,
} = require("../helper/cloudinaryHelper");
const { validateProductData } = require("../validation/product.validation");
const { uploadFilesToCloudinary } = require("../utils/cloudinaryUtils");
const fs = require("fs").promises;
const cloudinary = require("cloudinary").v2;

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

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const file = req.file;

    // Lấy thông tin product hiện tại từ database
    const existingProduct = await getProductById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Validate dữ liệu đầu vào
    const { error } = validateProductData(req.body);
    if (error) {
      if (req.file && req.file.path) await fs.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((err) => err.message),
      });
    }

    let newImageUrl = existingProduct.imageUrl;
    let newPublicId = null;

    // Nếu có ảnh upload mới
    if (req.file) {
      const newImageHash = generateHash(req.file.path);
      const oldImageHash = await getCloudinaryETag(existingProduct.imageUrl);

      // So sánh hash, nếu khác thì mới upload lên Cloudinary
      if (newImageHash !== oldImageHash) {
        const uploadedImage = await uploadFilesToCloudinary([file]);

        if (!uploadedImage.success || uploadedImage.data.length === 0) {
          await fs.unlink(file.path);
          return res.status(500).json({
            message: "Error uploading image to Cloudinary",
          });
        }

        // Lấy giá trị từ mảng dữ liệu trả về
        newImageUrl = uploadedImage.data[0].url;
        newPublicId = uploadedImage.data[0].public_id;

        // Xóa ảnh cũ trên Cloudinary
        const oldPublicId = extractPublicId(existingProduct.imageUrl);
        if (oldPublicId) await cloudinary.uploader.destroy(oldPublicId);
      } else {
        // Nếu ảnh giống nhau, không upload và xóa file tạm
        await fs.unlink(req.file.path);
      }
    }

    // Cập nhật database
    const updatedProductData = {
      ...req.body,
      imageUrl: newImageUrl,
    };

    const updatedProduct = await updateProductById(
      productId,
      updatedProductData
    );
    return res.status(200).json({
      success: true,
      message: "Series updated successfully",
      data: updatedProduct,
    });
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
  updateProduct,
  deleteProduct,
};
