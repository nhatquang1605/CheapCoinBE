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
module.exports = { extractPublicId };
