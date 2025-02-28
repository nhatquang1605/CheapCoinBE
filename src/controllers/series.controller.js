const { date } = require("joi");
const {
  addSeries,
  getAllSeries,
  getSeriesById,
  deleteSeriesById,
  updateSeriesById,
} = require("../services/series.service");
const {
  getAllProductsBySeriesId,
  deleteProductById,
  getMainProductOfSeries,
} = require("../services/product.service");
const { validateSeriesData } = require("../validation/series.validation");
const {
  uploadFilesToCloudinary,
  deleteUploadedImages,
} = require("../utils/cloudinaryUtils");
const cloudinary = require("cloudinary").v2;
const {
  extractPublicId,
  generateHash,
  getCloudinaryETag,
} = require("../helper/cloudinaryHelper");
const fs = require("fs").promises;

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
      quantity,
      releaseDate,
    } = req.body;

    const files = req.files; // Lấy file từ multer

    // Kiểm tra xem file đại diện có tồn tại không
    if (!files || files.length < 6 || files.length > 13) {
      return res
        .status(400)
        .json({ message: "Please upload between 6 and 13 images" });
    }

    // Validate dữ liệu từ req.body
    const { error } = validateSeriesData(req.body);

    if (error)
      return res.status(400).json({ message: error.details[0].message });

    // Upload ảnh lên Cloudinary
    let imageUrls;
    try {
      imageUrls = await uploadFilesToCloudinary(files);
    } catch (uploadError) {
      return res
        .status(500)
        .json({ message: "Failed to upload images to Cloudinary" });
    }

    // Lưu thông tin series vào database
    try {
      const newSeries = await addSeries({
        name,
        description,
        price,
        totalCharacters,
        size,
        material,
        ageToUse,
        quantity,
        posterImageURL: imageUrls[0], // Ảnh đầu tiên làm ảnh đại diện
        imageUrls, // Lưu toàn bộ ảnh
        isTagNew: true,
        releaseDate,
      });

      return res
        .status(201)
        .json({ message: "Series created successfully", series: newSeries });
    } catch (dbError) {
      // Nếu lỗi khi lưu DB => Xóa ảnh đã upload
      await deleteUploadedImages(imageUrls);
      console.log(dbError.stack || dbError.message);
      return res
        .status(500)
        .json({ message: "Failed to save series in database" });
    }
  } catch (error) {
    console.error("Full error stack:", error.stack || error.message);
    res.status(500).json({ message: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const { page, limit, name, isAvailable, sortBy, sortOrder } = req.query;

    const filters = { name, isAvailable };
    const sort = sortBy
      ? { [sortBy]: sortOrder === "desc" ? -1 : 1 }
      : { createdAt: -1 };

    const data = await getAllSeries({ page, limit, filters, sort });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách series thành công",
      ...data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID từ params
    const series = await getSeriesById(id);

    // Lấy thông tin mainProduct theo seriesID
    const mainProduct = await getMainProductOfSeries(id);

    const data = { series, mainProduct };
    res.status(200).json({ success: true, data: data });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const deleteSeries = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID từ params
    const series = await getSeriesById(id);

    // Xóa ảnh trên Cloudinary nếu tồn tại
    if (series.posterImageURL) {
      const publicId = extractPublicId(series.posterImageURL); // Hàm trích xuất public_id từ URL
      await cloudinary.uploader.destroy(publicId); // Xóa ảnh trên Cloudinary
    }

    const result = await deleteSeriesById(id);

    const deletedProduct = await getAllProductsBySeriesId(id);

    for (let i = 0; i < deletedProduct.length; i++) {
      // Xóa ảnh trên Cloudinary nếu tồn tại
      if (deletedProduct[i].imageUrl) {
        let publicIdProduct = extractPublicId(deletedProduct[i].imageUrl); // Hàm trích xuất public_id từ URL
        await cloudinary.uploader.destroy(publicIdProduct); // Xóa ảnh trên Cloudinary
      }
      await deleteProductById(deletedProduct[i].id);
    }

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Series không tồn tại!",
      });
    }
    res.status(200).json({
      success: true,
      message: "Xóa series thành công!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi xóa series!",
      error: error.message,
    });
  }
};

const updateSeries = async (req, res) => {
  try {
    const seriesId = req.params.id;
    const file = req.file;

    // Lấy thông tin series hiện tại từ database
    const existingSeries = await getSeriesById(seriesId);
    if (!existingSeries) {
      return res.status(404).json({ message: "Series not found" });
    }

    // Validate dữ liệu đầu vào
    const { error } = validateSeriesData(req.body);
    if (error) {
      if (req.file && req.file.path) await fs.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((err) => err.message),
      });
    }

    let newImageUrl = existingSeries.posterImageURL;
    let newPublicId = null;

    // Nếu có ảnh upload mới
    if (req.file) {
      const newImageHash = generateHash(req.file.path);
      const oldImageHash = await getCloudinaryETag(
        existingSeries.posterImageURL
      );

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
        const oldPublicId = extractPublicId(existingSeries.posterImageURL);
        if (oldPublicId) await cloudinary.uploader.destroy(oldPublicId);
      } else {
        // Nếu ảnh giống nhau, không upload và xóa file tạm
        await fs.unlink(req.file.path);
      }
    }

    // Cập nhật database
    const updatedSeriesData = {
      ...req.body,
      posterImageURL: newImageUrl,
    };

    const updatedSeries = await updateSeriesById(seriesId, updatedSeriesData);
    return res.status(200).json({
      success: true,
      message: "Series updated successfully",
      data: updatedSeries,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

module.exports = { createSeries, getAll, getById, deleteSeries, updateSeries };
