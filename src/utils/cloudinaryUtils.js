const cloudinary = require("cloudinary").v2;
const fs = require("fs/promises");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

async function uploadFilesToCloudinary(files) {
  try {
    const uploadResults = [];

    for (const file of files) {
      // Upload file lên Cloudinary
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: "CheapCoinProduct",
      });

      // Push kết quả URL và public_id vào mảng
      uploadResults.push({
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      });

      // Xóa file tạm sau khi upload
      await fs.unlink(file.path);
    }

    // Trả về danh sách các URL của ảnh
    return {
      success: true,
      data: uploadResults,
    };
  } catch (error) {
    console.error("Error uploading files to Cloudinary:", error.message);

    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = { uploadFilesToCloudinary };
