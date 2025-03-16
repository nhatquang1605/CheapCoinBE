const express = require("express");
const router = express.Router();
const productSoldController = require("../controllers/productSold.controller");
const { verifyToken } = require("../middleware/auth");

// Lấy tất cả sản phẩm đã bán
router.get("/admin/sold-products", verifyToken, productSoldController.getAllSoldProducts);

// Lấy dữ liệu thống kê sản phẩm đã bán
router.get("/admin/sold-analytics", verifyToken, productSoldController.getSoldProductAnalytics);

module.exports = router;