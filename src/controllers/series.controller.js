const { date } = require("joi");
const {
  addSeries,
  getAllSeries,
  getSeriesById,
  deleteSeriesById,
  updateSeriesById,
} = require("../services/series.service");
const {
  validateSeriesData,
  validateSeriesUpdate,
} = require("../validation/series.validation");
const cloudinary = require("cloudinary").v2;

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
    const representativeImageURL = req.file ? req.file.path : null;

    //check representative is required
    if (!representativeImageURL) {
      return res
        .status(400)
        .json({ message: "Representative image is required" });
    }

    //validation from req.body
    const { error } = validateSeriesData(req.body);

    if (error) {
      if (req.file && req.file.path) {
        const publicId = extractPublicId(req.file.path); // Hàm để lấy public_id từ URL Cloudinary
        await cloudinary.uploader.destroy(publicId);
      }
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((err) => err.message),
      });
    }

    //add series to db
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
      representativeImageURL,
    });

    res
      .status(201)
      .json({ message: "Series created successfully", series: newSeries });
  } catch (error) {
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
    const { error } = validateSeriesUpdate(req.body);
    if (error) {
      if (req.file && req.file.path) {
        const publicId = extractPublicId(req.file.path); // Hàm để lấy public_id từ URL Cloudinary
        await cloudinary.uploader.destroy(publicId);
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

const extractPublicId = (url) => {
  try {
    const segments = url.split("upload/")[1]; // Lấy phần sau "upload/"
    const withoutVersion = segments.replace(/v\d+\//, ""); // Loại bỏ version (vd: v1735188833)
    const publicIdWithExtension = withoutVersion.split(".")[0]; // Bỏ phần mở rộng
    return publicIdWithExtension;
  } catch (error) {
    console.error("Error extracting public_id:", error.message);
    return null;
  }
};

module.exports = { createSeries, getAll, getById, deleteSeries, updateSeries };
