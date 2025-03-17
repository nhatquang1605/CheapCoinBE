const productSoldService = require("../services/productSold.service");

const getAllSoldProducts = async (req, res) => {
  try {
    const soldProducts = await productSoldService.getAllSoldProducts();
    return res.status(200).json({
      message: "Lấy tất cả sản phẩm đã bán thành công",
      soldProducts: soldProducts,
    });
  } catch (error) {
    console.error("Error in getAllSoldProducts:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
  }
};

const getSoldProductAnalytics = async (req, res) => {
  try {
    const analytics = await productSoldService.getSoldProductAnalytics();
    return res.status(200).json({
      message: "Lấy dữ liệu thống kê sản phẩm đã bán thành công",
      analytics,
    });
  } catch (error) {
    console.error("Error in getSoldProductAnalytics:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = {
  getAllSoldProducts,
  getSoldProductAnalytics,
};
