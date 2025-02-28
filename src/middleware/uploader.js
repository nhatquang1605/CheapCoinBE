const multer = require("multer");

const storage = multer.memoryStorage(); // Lưu vào RAM

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024, files: 13 }, // Max 15MB mỗi ảnh, tối đa 13 ảnh
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
    allowedMimeTypes.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Invalid file type."));
  },
});

module.exports = upload;
