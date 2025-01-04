const {
  addProduct,
  saveProductImages,
  checkSeriesExistence,
} = require("../services/product.service");
const cloudinary = require("cloudinary").v2;
const { extractPublicId } = require("../helper/cloudinaryHelper");
const { validateProductData } = require("../validation/product.validation");

const createProduct = async (req, res) => {
  try {
    const {
      productName,
      description,
      stockQuantity,
      seriesID,
      isSpecialEdition,
      releaseDate,
    } = req.body;

    // Chuyển req.files thành mảng tên file hoặc đường dẫn
    const files = req.files || []; // Nếu không có file, gán giá trị rỗng
    const imagePaths = files.map((file) => file.path); // Hoặc dùng file.filename nếu cần

    // Gán images vào req.body
    const data = {
      ...req.body,
      images: imagePaths, // Thêm trường images từ files
    };

    // Kiểm tra series tồn tại
    const isSeriesValid = await checkSeriesExistence(seriesID);
    if (!isSeriesValid) {
      if (req.files && req.files.length > 0) {
        // Duyệt qua tất cả các file và xóa từng ảnh trên Cloudinary
        for (const file of req.files) {
          const publicId = extractPublicId(file.path);
          await cloudinary.uploader.destroy(publicId);
        }
      }
      return res.status(404).json({
        success: false,
        message: "Series does not exist",
      });
    }

    // Thực hiện validate dữ liệu đầu vào
    const { error } = validateProductData(data);

    if (error) {
      // Kiểm tra nếu có nhiều ảnh
      if (req.files && req.files.length > 0) {
        // Duyệt qua tất cả các file và xóa từng ảnh trên Cloudinary
        for (const file of req.files) {
          const publicId = extractPublicId(file.path);
          await cloudinary.uploader.destroy(publicId);
        }
      }
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((err) => err.message),
      });
    }

    // Tạo mới sản phẩm
    const newProduct = await addProduct({
      productName,
      description,
      stockQuantity,
      seriesID,
      isSpecialEdition,
      releaseDate,
    });

    // Upload và lưu ảnh
    const images = req.files;
    if (images && images.length > 0) {
      const imageRecords = images.map((file, index) => ({
        productID: newProduct._id,
        imageURL: file.path,
        isPrimary: index === 0, // Ảnh đầu tiên là đại diện
      }));
      await saveProductImages(imageRecords);
    }

    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
};
