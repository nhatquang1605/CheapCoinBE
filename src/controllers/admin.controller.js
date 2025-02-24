const adminService = require("../services/admin.service");

const getOverview = async (req, res) => {
  try {
    const { month, year } = req.query;
    const data = await adminService.getOverview(
      parseInt(month),
      parseInt(year)
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getYearlyRevenue = async (req, res) => {
  try {
    const { year } = req.query;
    const data = await adminService.getYearlyRevenue(parseInt(year));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getTopSellingSeries = async (req, res) => {
  try {
    const data = await adminService.getTopSellingSeries();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getOverview, getYearlyRevenue, getTopSellingSeries };
