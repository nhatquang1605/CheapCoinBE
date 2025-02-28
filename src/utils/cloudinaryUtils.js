const cloudinary = require("cloudinary").v2;
const fs = require("fs/promises");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

async function uploadFilesToCloudinary(files) {
  try {
    const uploadPromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "CheapCoinProduct" },
          (error, result) => {
            if (error)
              return reject(new Error("Error uploading images to Cloudinary"));
            resolve(result.secure_url); // ✅ Trả về URL ảnh sau khi upload
          }
        );
        uploadStream.end(file.buffer);
      });
    });

    return await Promise.all(uploadPromises); // ✅ Trả về danh sách URL ảnh
  } catch (error) {
    throw new Error("Error uploading images to Cloudinary");
  }
}

// Hàm xoá ảnh trên Cloudinary khi có lỗi xảy ra
async function deleteUploadedImages(imageUrls) {
  await Promise.all(
    imageUrls.map(async (url) => {
      const publicId = url.split("/").pop().split(".")[0]; // Lấy public ID từ URL ảnh
      await cloudinary.uploader.destroy(`CheapCoinProduct/${publicId}`);
    })
  );
}

module.exports = { uploadFilesToCloudinary, deleteUploadedImages };
