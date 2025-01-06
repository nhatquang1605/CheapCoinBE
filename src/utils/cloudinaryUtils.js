const cloudinary = require("cloudinary").v2;
const fs = require("fs/promises");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

async function uploadFilesToCloudinary(files) {
  const uploadResults = [];
  for (const file of files) {
    const uploadResult = await cloudinary.uploader.upload(file.path, {
      folder: "CheapCoinProduct",
    });
    uploadResults.push({
      public_id: uploadResult.public_id,
      url: uploadResult.secure_url,
    });

    // Xóa file tạm sau khi upload
    await fs.unlink(file.path);
  }
  return uploadResults;
}

module.exports = { uploadFilesToCloudinary };
