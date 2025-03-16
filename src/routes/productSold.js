const express = require("express");
const router = express.Router();
const productSoldController = require("../controllers/productSold.controller");
const { verifyToken, adminMiddleware } = require("../middleware/auth");

// Lấy tất cả sản phẩm đã bán
router.get(
  "/admin/sold-products",
  verifyToken,
  adminMiddleware,
  productSoldController.getAllSoldProducts
);

// Lấy dữ liệu thống kê sản phẩm đã bán
router.get(
  "/admin/sold-analytics",
  verifyToken,
  adminMiddleware,
  productSoldController.getSoldProductAnalytics
);

module.exports = router;
