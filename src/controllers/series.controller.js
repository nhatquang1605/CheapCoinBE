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
} = require("../services/product.service");
const { validateSeriesData } = require("../validation/series.validation");
const { uploadFilesToCloudinary } = require("../utils/cloudinaryUtils");
const cloudinary = require("cloudinary").v2;
const { extractPublicId } = require("../helper/cloudinaryHelper");
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
    } = req.body;

    const file = req.file; // Lấy file từ multer

    // Kiểm tra xem file đại diện có tồn tại không
    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "Representative image is required" });
    }

    // Validate dữ liệu từ req.body
    const { error } = validateSeriesData(req.body);

    if (error) {
      // Xóa file tạm nếu validate thất bại
      await fs.unlink(file.path);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((err) => err.message),
      });
    }

    // Upload file lên Cloudinary
    const uploadedImage = await uploadFilesToCloudinary([file]);

    // Kiểm tra nếu upload thất bại
    if (!uploadedImage.success || uploadedImage.data.length === 0) {
      // Xóa file tạm trong trường hợp upload thất bại
      await fs.unlink(file.path);
      return res.status(500).json({
        message: "Error uploading representative image to Cloudinary",
      });
    }

    // Lấy URL từ Cloudinary
    const representativeImageURL = uploadedImage.data[0].url;

    // Tạo series mới và lưu vào database
    const releaseDate = Date.now();
    const isTagNew = true;

    const newSeries = await addSeries({
      name,
      description,
      price,
      releaseDate,
      totalCharacters,
      size,
      material,
      ageToUse,
      isTagNew,
      representativeImageURL, // Lưu URL từ Cloudinary
    });
    res
      .status(201)
      .json({ message: "Series created successfully", series: newSeries });
  } catch (error) {
    console.error("Full error stack:", error.stack || error.message);
    res.status(500).json({ message: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const { page, limit, skip } = req.pagination; // Lấy thông tin phân trang từ middleware
    const data = await getAllSeries(page, limit, skip);
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
    res.status(200).json({ success: true, data: series });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const deleteSeries = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteSeriesById(id);
    const deletedProduct = await getAllProductsBySeriesId(id);

    for (let i = 0; i < deletedProduct.length; i++) {
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

    // Lấy thông tin series hiện tại từ database
    const existingSeries = await getSeriesById(seriesId);
    if (!existingSeries) {
      return res.status(404).json({ message: "Series not found" });
    }

    //validate thông tin
    const { error } = validateSeriesData(req.body);
    if (error) {
      if (req.file && req.file.path) {
        await Promise.all(req.files.map((file) => fs.unlink(file.path)));
      }
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((err) => err.message),
      });
    }

    let newImageUrl = existingSeries.representativeImageURL; // URL ảnh cũ mặc định
    let newPublicId = null;

    // Nếu người dùng upload ảnh mới
    if (req.file) {
      const uploadedFileUrl = req.file.path; // URL của ảnh mới từ Cloudinary
      if (uploadedFileUrl !== existingSeries.image) {
        // Nếu ảnh mới khác ảnh cũ
        newImageUrl = uploadedFileUrl; // Cập nhật URL ảnh
        newPublicId = req.file.filename; // Lưu public_id của ảnh mới

        // Xóa ảnh cũ trên Cloudinary
        const oldPublicId = extractPublicId(existingSeries.image);
        await cloudinary.uploader.destroy(oldPublicId);
      } else {
        // Nếu ảnh mới giống ảnh cũ, xóa ảnh mới vừa upload
        await cloudinary.uploader.destroy(req.file.filename);
      }
    }

    // Cập nhật trong database
    const updatedSeries = await updateSeriesById(seriesId, req.body);

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
