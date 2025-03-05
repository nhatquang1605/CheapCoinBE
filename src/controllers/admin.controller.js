const adminService = require("../services/admin.service");

const getOverview = async (req, res) => {
  try {
    const { month, year } = req.query;
    // Nếu không truyền month/year, lấy tháng và năm hiện tại
    const today = new Date();

    month = parseInt(month) || today.getMonth() + 1; // Vì getMonth() trả về 0-11
    year = parseInt(year) || today.getFullYear();

    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(`${year}-${month + 1}-01`);
    const data = await adminService.getOverview(startDate, endDate);
    res.status(200).json({
      message: "Lấy dữ liệu theo tháng thành công",
      data,
    });
  } catch (error) {
    console.error("Full error stack:", error.stack || error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getYearlyRevenue = async (req, res) => {
  try {
    const { year } = req.query;
    const today = new Date();
    year = parseInt(year) || today.getFullYear();
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year + 1}-01-01`);
    const data = await adminService.getYearlyRevenue(startDate, endDate);
    res.status(200).json({
      message: "Lấy dữ liệu theo từng tháng trong năm thành công",
      data,
    });
  } catch (error) {
    console.error("Full error stack:", error.stack || error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getTopSellingSeries = async (req, res) => {
  try {
    const data = await adminService.getTopSellingSeries();
    res.status(200).json({
      message: "Lấy những series bán chạy nhất thành công",
      data,
    });
  } catch (error) {
    console.error("Full error stack:", error.stack || error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getOverview, getYearlyRevenue, getTopSellingSeries };
