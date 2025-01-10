const crypto = require("crypto");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

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

// Hàm tạo hash từ file
const generateHash = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash("md5").update(fileBuffer).digest("hex");
};

// Hàm lấy ETag từ Cloudinary
const getCloudinaryETag = async (imageUrl) => {
  const publicId = extractPublicId(imageUrl);
  const resource = await cloudinary.api.resource(publicId);

  return resource.etag; // ETag là hash của ảnh trên Cloudinary
};
module.exports = { extractPublicId, generateHash, getCloudinaryETag };
