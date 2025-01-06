const {
  addProduct,
  saveProductImages,
  checkSeriesExistence,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProductById,
} = require("../services/product.service");
const { extractPublicId } = require("../helper/cloudinaryHelper");
const { validateProductData } = require("../validation/product.validation");
const { uploadFilesToCloudinary } = require("../utils/cloudinaryUtils");
const fs = require("fs/promises");

//   try {
//     const {
//       productName,
//       description,
//       stockQuantity,
//       seriesID,
//       isSpecialEdition,
//       releaseDate,
//     } = req.body;

//     // Chuyển req.files thành mảng tên file hoặc đường dẫn
//     const files = req.files || []; // Nếu không có file, gán giá trị rỗng
//     const imagePaths = files.map((file) => file.path); // Hoặc dùng file.filename nếu cần

//     // Gán images vào req.body
//     const data = {
//       ...req.body,
//       images: imagePaths, // Thêm trường images từ files
//     };

//     // Kiểm tra series tồn tại
//     const isSeriesValid = await checkSeriesExistence(seriesID);
//     if (!isSeriesValid) {
//       if (req.files && req.files.length > 0) {
//         // Duyệt qua tất cả các file và xóa từng ảnh trên Cloudinary
//         for (const file of req.files) {
//           const publicId = extractPublicId(file.path);
//           await cloudinary.uploader.destroy(publicId);
//         }
//       }
//       return res.status(404).json({
//         success: false,
//         message: "Series does not exist",
//       });
//     }

//     // Thực hiện validate dữ liệu đầu vào
//     const { error } = validateProductData(data);

//     if (error) {
//       // Kiểm tra nếu có nhiều ảnh
//       if (req.files && req.files.length > 0) {
//         // Duyệt qua tất cả các file và xóa từng ảnh trên Cloudinary
//         for (const file of req.files) {
//           const publicId = extractPublicId(file.path);
//           await cloudinary.uploader.destroy(publicId);
//         }
//       }
//       return res.status(400).json({
//         success: false,
//         message: "Validation error",
//         errors: error.details.map((err) => err.message),
//       });
//     }

//     // Tạo mới sản phẩm
//     const newProduct = await addProduct({
//       productName,
//       description,
//       stockQuantity,
//       seriesID,
//       isSpecialEdition,
//       releaseDate,
//     });

//     // Upload và lưu ảnh
//     const images = req.files;
//     if (images && images.length > 0) {
//       const imageRecords = images.map((file, index) => ({
//         productID: newProduct._id,
//         imageURL: file.path,
//         isPrimary: index === 0, // Ảnh đầu tiên là đại diện
//       }));
//       await saveProductImages(imageRecords);
//     }

//     res.status(201).json({
//       message: "Product created successfully",
//       product: newProduct,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

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
        await Promise.all(req.files.map((file) => fs.unlink(file.path)));
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
        await Promise.all(req.files.map((file) => fs.unlink(file.path)));
      }
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((err) => err.message),
      });
    }

    // Upload ảnh lên Cloudinary
    const uploadedImages = await uploadFilesToCloudinary(files);

    // Tạo sản phẩm
    const newProduct = await addProduct({
      productName,
      description,
      stockQuantity,
      seriesID,
      isSpecialEdition,
      releaseDate,
    });

    // Lưu thông tin ảnh vào DB
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
